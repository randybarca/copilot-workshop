# Task Manager CLI — Technical Design

## 1. Data Models

### Entity: `Task`

| Property      | Type                                | Required | Validation rules                                                    |
|---------------|-------------------------------------|----------|---------------------------------------------------------------------|
| `id`          | `number`                            | Yes      | Auto-increment integer ≥ 1; immutable after creation                |
| `title`       | `string`                            | Yes      | Non-empty after trim; max 100 characters                            |
| `description` | `string`                            | No       | Defaults to `""`; max 500 characters after trim                     |
| `status`      | `"todo" \| "in-progress" \| "done"` | Yes      | Defaults to `"todo"` on create; case-insensitive input, stored lowercase |
| `priority`    | `"low" \| "medium" \| "high"`       | Yes      | Defaults to `"medium"` on create; case-insensitive input, stored lowercase |
| `category`    | `string`                            | No       | Defaults to `"general"`; max 50 characters; alphanumeric + dash/underscore only |
| `createdAt`   | `string` (ISO 8601)                 | Yes      | Set once at creation via `new Date().toISOString()`; never mutated  |
| `updatedAt`   | `string` (ISO 8601)                 | Yes      | Matches `createdAt` on creation; refreshed on every update          |

### Validation Rules per Property

#### `id`
- Must be a positive integer (`Number.isInteger(v) && v >= 1`).
- Rejected values: `0`, negative numbers, floats, strings, `null`, `undefined`, `NaN`.
- On create: assigned by the store; callers must not supply it.
- On update/delete/show: must additionally exist in the store — store throws `Error('Task <id> not found')` if it does not.

#### `title`
- Required on `add`; optional on `update` (omitting it leaves the existing value unchanged).
- Value is trimmed before validation; a blank/whitespace-only string is rejected.
- Maximum 100 characters (measured after trim).
- Rejected values: empty string `""`, whitespace-only strings, non-string types.
- Stored as-trimmed.

#### `description`
- Optional on `add` and `update`; defaults to `""` when not supplied.
- When supplied, trimmed before validation.
- Maximum 500 characters (measured after trim).
- Any string (including empty) is accepted once it passes the length check.
- Non-string types are rejected.

#### `status`
- Accepted values (case-insensitive): `"todo"`, `"in-progress"`, `"done"`.
- Stored as lowercase after normalisation.
- Defaults to `"todo"` when not supplied on `add`.
- On `update`, omitting it leaves the existing value unchanged.
- All other strings and non-string types are rejected.

#### `priority`
- Accepted values (case-insensitive): `"low"`, `"medium"`, `"high"`.
- Stored as lowercase after normalisation.
- Defaults to `"medium"` when not supplied on `add`.
- On `update`, omitting it leaves the existing value unchanged.
- All other strings and non-string types are rejected.

#### `category`
- Optional on `add` and `update`; defaults to `"general"` when not supplied.
- When supplied, trimmed before validation.
- Maximum 50 characters (measured after trim).
- Accepted characters: alphanumeric (a–z, A–Z, 0–9), dash (`-`), underscore (`_`).
- Custom categories like `"work"`, `"personal"`, `"urgent"`, `"shopping"` are all allowed.
- Case is preserved as-supplied (not normalised to lowercase).
- Non-string types and strings with disallowed characters are rejected.

#### `createdAt`
- Set exactly once by `store.addTask` using `new Date().toISOString()`.
- Never accepted from the caller; ignored if supplied.
- Always a valid ISO 8601 UTC string in stored tasks.

#### `updatedAt`
- Set to the same value as `createdAt` by `store.addTask`.
- Refreshed to `new Date().toISOString()` by `store.updateTask` on every successful update.
- Never accepted from the caller; ignored if supplied.

---

### In-Memory Store

```js
let tasks = [];   // Task[]
let nextId = 1;   // auto-increment counter
```

Both variables are module-scoped in `src/store.js` and never exported
directly. All reads and writes go through the store's exported helper
functions.

---

## 2. File Structure

```
src/
├── index.js              # Entry point — parses process.argv and dispatches to command modules
├── store.js              # In-memory task array, nextId counter, and all CRUD helpers
├── help.js               # Prints full usage text to stdout
├── commands/
│   ├── add.js            # Validates inputs, calls store.addTask, prints confirmation
│   ├── list.js           # Applies --status / --priority filters and --sort, prints table
│   ├── show.js           # Looks up a single task by ID, prints detail view
│   ├── update.js         # Merges partial fields, refreshes updatedAt, prints diff
│   └── delete.js         # Removes a task by ID, prints confirmation
└── lib/
    ├── args.js           # Converts process.argv.slice(2) into { command, id, flags }
    ├── validate.js       # Pure validation functions; returns { ok, error }
    └── format.js         # Renders tasks as a padded table or a full detail view

test/
├── store.test.js         # Unit tests for every store helper function
├── validate.test.js      # Unit tests for every validation rule
├── args.test.js          # Unit tests for argument-parsing edge cases
└── commands.test.js      # Integration tests for command modules with a seeded store
```

---

## 3. Module Responsibilities

### `src/store.js`

Owns all mutable state. Exports:

| Export           | Signature                                   | Description                                           |
|------------------|---------------------------------------------|-------------------------------------------------------|
| `addTask`        | `(fields) => Task`                          | Creates a task, assigns `id`/`createdAt`/`updatedAt`, appends to array |
| `getTasks`       | `() => Task[]`                              | Returns a shallow copy of the full task array         |
| `getTaskById`    | `(id: number) => Task`                      | Returns the matching task; throws `Error` if not found |
| `updateTask`     | `(id: number, fields) => Task`              | Merges `fields` into the task, refreshes `updatedAt`; throws if not found |
| `deleteTask`     | `(id: number) => Task`                      | Removes the task from the array, returns the deleted task; throws if not found |

**Depends on:** nothing.

---

### `src/lib/args.js`

Stateless parser. Exports:

| Export       | Signature                            | Description                                                       |
|--------------|--------------------------------------|-------------------------------------------------------------------|
| `parseArgs`  | `(argv: string[]) => ParsedArgs`     | Converts `process.argv.slice(2)` into `{ command, id, flags }` using only string methods |

`ParsedArgs` shape:
```js
{
  command: string,       // e.g. 'add', 'list', 'show', 'update', 'delete', '--help'
  id: number | null,     // positional numeric argument, or null
  flags: Record<string, string | boolean>  // e.g. { title: '...', status: 'todo' }
}
```

**Depends on:** nothing.

---

### `src/lib/validate.js`

Stateless, pure functions. All return `{ ok: boolean, error?: string }`.
Exports:

| Export              | Signature                          | Description                               |
|---------------------|------------------------------------|-------------------------------------------|
| `validateTitle`     | `(value: unknown) => Result`       | Required; non-empty string; ≤ 100 chars   |
| `validateDescription` | `(value: unknown) => Result`     | Optional; ≤ 500 chars if provided         |
| `validateStatus`    | `(value: unknown) => Result`       | Must be `todo`, `in-progress`, or `done`  |
| `validatePriority`  | `(value: unknown) => Result`       | Must be `low`, `medium`, or `high`        |
| `validateCategory`  | `(value: unknown) => Result`       | Optional; max 50 chars; alphanumeric+dash+underscore only |
| `validateId`        | `(value: unknown) => Result`       | Must be a positive integer (not NaN)      |
| `validateSort`      | `(value: unknown) => Result`       | Must be `priority` or `date`              |

**Depends on:** nothing.

---

### `src/lib/format.js`

Stateless rendering helpers. Exports:

| Export          | Signature                   | Description                                                    |
|-----------------|-----------------------------|----------------------------------------------------------------|
| `formatTable`   | `(tasks: Task[]) => string` | Returns a padded-column table with ID, title, status, priority, createdAt |
| `formatDetail`  | `(task: Task) => string`    | Returns a multi-line label/value block showing all task fields |

**Depends on:** nothing.

---

### `src/commands/add.js`

Exports a single default function:

```js
export default function add(flags) { … }
```

Flow: `validateTitle` → `validateDescription` (optional) → `validatePriority`
(optional) → `validateCategory` (optional) → `store.addTask` → write confirmation to stdout.

**Depends on:** `store.js`, `lib/validate.js`.

---

### `src/commands/list.js`

Exports a single default function:

```js
export default function list(flags) { … }
```

Flow: optional `validateStatus` / `validatePriority` / `validateCategory` / `validateSort` →
`store.getTasks` → filter (by status, priority, and category) → sort → `format.formatTable` → stdout.

**Depends on:** `store.js`, `lib/validate.js`, `lib/format.js`.

---

### `src/commands/show.js`

```js
export default function show(id) { … }
```

Flow: `validateId` → `store.getTaskById` → `format.formatDetail` → stdout.  
On missing ID: stderr + `process.exit(1)`.

**Depends on:** `store.js`, `lib/validate.js`, `lib/format.js`.

---

### `src/commands/update.js`

```js
export default function update(id, flags) { … }
```

Flow: `validateId` → validate each supplied flag (title, description, status, priority, category) → `store.updateTask` → print
changed fields to stdout.

**Depends on:** `store.js`, `lib/validate.js`.

---

### `src/commands/delete.js`

```js
export default function deleteTask(id) { … }
```

Flow: `validateId` → `store.deleteTask` → print confirmation to stdout.  
On missing ID: stderr + `process.exit(1)`.

**Depends on:** `store.js`, `lib/validate.js`.

---

### `src/help.js`

```js
export default function help() { … }
```

Writes full usage text (all commands and flags with examples) to stdout, then
returns. Does not call `process.exit`.

**Depends on:** nothing.

---

### `src/index.js`

Entry point. Not exported.

Flow:
1. `parseArgs(process.argv.slice(2))` → `{ command, id, flags }`.
2. `switch (command)` dispatches to the correct command module.
3. Unknown command → stderr + `process.exit(1)`.
4. Entire dispatch is wrapped in `try/catch` → uncaught exceptions exit with
   code 2.

**Depends on:** `lib/args.js`, all `commands/*.js`, `help.js`.

---

## 4. Error Handling Strategy

### Error types and throw sites

| Error type | Where thrown | Consumed by |
|---|---|---|
| Validation failure | `src/lib/validate.js` returns `{ ok: false, error }` — never throws | Each command module checks `ok` and writes to stderr |
| Missing task (unknown ID) | `src/store.js` — `getTaskById`, `updateTask`, `deleteTask` throw `Error('Task <id> not found')` | Command modules catch and write to stderr, then `process.exit(1)` |
| Unknown command | `src/index.js` switch default — writes to stderr | n/a — handled inline |
| Uncaught runtime exception | Any module — bubbles to `src/index.js` `catch` block | `src/index.js` writes `Error: unexpected error — <e.message>` to stderr, exits 2 |

### Exit codes

| Code | Meaning |
|------|---------|
| `0`  | Command completed successfully |
| `1`  | User error — invalid input, unknown ID, bad flag value |
| `2`  | Internal error — unexpected runtime exception |

### Output rules

- **Errors always go to stderr** via `process.stderr.write(msg + '\n')` — never `console.error` or `console.log`.
- **Success output goes to stdout** only.
- User-facing error messages are followed by a hint line:
  ```
  Error: unknown status "archived". Valid values: todo, in-progress, done
  Hint:  run `node src/index.js --help` for usage.
  ```
- Error messages use present tense and name the invalid value explicitly.
- `src/lib/validate.js` never calls `process.exit`; exit decisions belong to command modules and `index.js`.
