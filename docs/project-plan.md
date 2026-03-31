# Task Manager CLI — Project Plan

## 1. Project Overview

A command-line Task Manager application built with Node.js 20+ and zero
external dependencies. Users can create, list, update, delete, filter, and
sort tasks entirely from the terminal. Tasks support optional categories (e.g.,
"work", "personal", "urgent") for better organization and filtering. All task
data is held in an in-process array (no database or file I/O), making the
application self-contained and easy to extend. The project is intentionally
scoped as a single-session workshop exercise that demonstrates core Node.js
patterns: modular design, structured data manipulation, and a clean CLI
interface using only built-in modules.

---

## 2. User Stories

1. **Create a task**
   - As a user, I can run `node src/index.js add --title "..." --description "..." --priority low|medium|high --category "..."` to create a new task.
   - Acceptance criteria:
     - Task is assigned a unique numeric ID (auto-increment).
     - `status` defaults to `todo`.
     - `createdAt` and `updatedAt` are set to the current ISO timestamp.
     - The CLI prints a confirmation with the new task's ID.

2. **List all tasks**
   - As a user, I can run `node src/index.js list` to see every task.
   - Acceptance criteria:
     - Each row shows ID, title, status, priority, and `createdAt`.
     - Output is formatted as a readable table (padded columns).

3. **Filter tasks by status**
   - As a user, I can run `node src/index.js list --status todo|in-progress|done` to see only matching tasks.
   - Acceptance criteria:
     - Only tasks whose `status` matches the filter are shown.
     - If no tasks match, the CLI prints "No tasks found."

4. **Filter tasks by priority**
   - As a user, I can run `node src/index.js list --priority low|medium|high` to see only matching tasks.
   - Acceptance criteria:
     - Only tasks whose `priority` matches the filter are shown.
     - Filters for `--status` and `--priority` may be combined in one command.

5. **Sort tasks**
   - As a user, I can run `node src/index.js list --sort priority|date` to order results.
   - Acceptance criteria:
     - `priority` sort order: `high` → `medium` → `low`.
     - `date` sort order: newest `createdAt` first.
     - Sorting and filtering can be combined in one command.

6. **View a single task**
   - As a user, I can run `node src/index.js show <id>` to see full details of one task.
   - Acceptance criteria:
     - All fields (ID, title, description, status, priority, createdAt, updatedAt) are displayed.
     - If the ID does not exist, the CLI prints an error and exits with code 1.

7. **Update a task**
   - As a user, I can run `node src/index.js update <id> [--title "..."] [--description "..."] [--status ...] [--priority ...]` to modify a task.
   - Acceptance criteria:
     - Only the supplied fields are changed; others are preserved.
     - `updatedAt` is refreshed to the current ISO timestamp.
     - The CLI confirms which fields were updated.
     - If the ID does not exist, the CLI prints an error and exits with code 1.

8. **Delete a task**
   - As a user, I can run `node src/index.js delete <id>` to remove a task.
   - Acceptance criteria:
     - The task is removed from the in-memory store.
     - The CLI prints a confirmation with the deleted task's title.
     - If the ID does not exist, the CLI prints an error and exits with code 1.

9. **Assign a category to a task**
   - As a user, I can assign an optional category (e.g., "work", "personal", "urgent") when creating or updating a task.
   - Acceptance criteria:
     - Category is a string; max 50 characters.
     - If no category is specified, it defaults to `"general"`.
     - Category can be updated independently of other task fields.
     - The `create` and `update` commands accept `--category "..."` flag.

10. **Filter tasks by category**
   - As a user, I can run `node src/index.js list --category "..."` to see only tasks in a specific category.
   - Acceptance criteria:
     - Only tasks whose `category` matches the filter are shown.
     - Filter can be combined with `--status`, `--priority`, and `--sort`.
     - If no tasks match, the CLI prints "No tasks found."

11. **Display help**
   - As a user, I can run `node src/index.js --help` to see all available commands and flags.
   - Acceptance criteria:
     - Help text lists every command with a short description and example.

---

## 3. Data Model

### Entity: `Task`

| Property      | Type                                  | Notes                                      |
|---------------|---------------------------------------|--------------------------------------------|
| `id`          | `number`                              | Auto-increment integer, starts at 1        |
| `title`       | `string`                              | Required; max 100 characters               |
| `description` | `string`                              | Optional; defaults to empty string         |
| `status`      | `"todo" \| "in-progress" \| "done"`   | Required; defaults to `"todo"` on create   |
| `priority`    | `"low" \| "medium" \| "high"`         | Required; defaults to `"medium"` on create |
| `category`    | `string`                              | Optional; defaults to `"general"`; max 50 chars |
| `createdAt`   | `string` (ISO 8601)                   | Set once at creation; never mutated        |
| `updatedAt`   | `string` (ISO 8601)                   | Refreshed on every update                  |

### In-Memory Store

```js
// src/store.js
let tasks = [];      // Task[]
let nextId = 1;      // auto-increment counter
```

---

## 4. File Structure

```
src/
├── index.js          # Entry point — parses process.argv and dispatches commands
├── store.js          # In-memory data store (tasks array + nextId counter)
├── commands/
│   ├── add.js        # Implements the `add` command
│   ├── list.js       # Implements `list` with filtering/sorting
│   ├── show.js       # Implements the `show <id>` command
│   ├── update.js     # Implements the `update <id>` command
│   └── delete.js     # Implements the `delete <id>` command
├── lib/
│   ├── args.js       # Parses process.argv into a structured { command, id, flags } object
│   ├── validate.js   # Validates and normalises field values (status, priority, title length)
│   └── format.js     # Renders tasks as formatted table or detail view
└── help.js           # Prints help text to stdout
```

No `test/` directory is included for this phase; testing is addressed in
Phase 3.

---

## 5. Implementation Phases

### Phase 1 — Core infrastructure (Milestone 1)

**Goal:** Runnable skeleton with data layer and argument parsing.

1. Create `src/store.js` with the `tasks` array, `nextId`, and helper
   functions: `addTask`, `getTasks`, `getTaskById`, `updateTask`, `deleteTask`.
2. Create `src/lib/args.js` that converts `process.argv.slice(2)` into a plain
   object `{ command, id, flags }` using only string manipulation (no
   `minimist`).
3. Create `src/lib/validate.js` with pure functions that reject invalid
   `status`, `priority`, `category`, and empty `title` values, returning `{ ok, error }`.
4. Create `src/index.js` that reads the parsed command and calls a stub
   function from each command module (each stub just logs its name).
5. Verify the skeleton runs without errors: `node src/index.js --help`.

**Exit criterion:** `node src/index.js --help` prints placeholder text and
exits with code 0.

---

### Phase 2 — Command implementation (Milestone 2)

**Goal:** All eight user stories are functional.

1. Implement `src/commands/add.js` — validate inputs, call `store.addTask`,
   print confirmation.
2. Implement `src/lib/format.js` — `formatTable(tasks)` and
   `formatDetail(task)` using `String.prototype.padEnd` for alignment.
3. Implement `src/commands/list.js` — apply `--status`, `--priority`, and
   `--sort` filters, then call `formatTable`.
4. Implement `src/commands/show.js` — look up by ID, call `formatDetail`, exit
   1 on missing ID.
5. Implement `src/commands/update.js` — merge partial fields, refresh
   `updatedAt`, print changed fields.
6. Implement `src/commands/delete.js` — remove from store, print confirmation,
   exit 1 on missing ID.
7. Implement `src/help.js` with full usage text.
8. Wire all commands into `src/index.js`.

**Exit criterion:** All user-story acceptance criteria pass when exercised
manually via the CLI.

---

### Phase 3 — Testing (Milestone 3)

**Goal:** Automated coverage of the store and command logic using Node.js
built-in `assert` and the `node:test` runner (Node.js 18+).

1. Create `test/store.test.js` — unit tests for all store helper functions.
2. Create `test/validate.test.js` — unit tests for each validation rule.
3. Create `test/args.test.js` — unit tests for argument parsing edge cases
   (missing flags, unknown commands, numeric ID coercion).
4. Create `test/commands.test.js` — integration-style tests that call command
   modules with a pre-populated store and assert stdout via a captured write.
4. Add tests for category validation (max 50 chars, alphanumeric + underscore/dash)
   and category filtering (empty, nonexistent, multiple matches).
5. Run the suite: `node --test`.

**Exit criterion:** `node --test` reports zero failing tests.

---

### Phase 4 — Polish (Milestone 4)

**Goal:** Finish line — help text, edge cases, and code quality.

1. Ensure `--help` output matches the final command signatures.
2. Add input-length guard (title ≤ 100 chars) to `validate.js`.
3. Handle unknown commands gracefully (print error + hint, exit 1).
4. Review all error messages for clarity and consistency.
5. Confirm the entire implementation uses only built-in Node.js modules.

**Exit criterion:** A fresh clone, `node src/index.js --help`, and
`node --test` all succeed with no warnings.

---

## 6. Error Handling Conventions

### Exit codes

| Code | Meaning                                              |
|------|------------------------------------------------------|
| `0`  | Success — command completed normally                 |
| `1`  | User error — invalid input, missing ID, bad flag     |
| `2`  | Internal error — unexpected runtime exception        |

### Error message format

All error messages are written to **stderr** (never stdout) so they do not
pollute piped output. Every message follows the pattern:

```
Error: <human-readable description>
```

For recoverable user errors the message is followed by a usage hint:

```
Error: unknown status "archived". Valid values: todo, in-progress, done
Hint:  run `node src/index.js --help` for usage.
```

### Where errors are handled

- `src/lib/validate.js` — returns `{ ok: false, error: string }` for every
  constraint violation; never throws.
- `src/commands/*.js` — checks the `ok` flag, writes the error to stderr via
  `process.stderr.write`, and calls `process.exit(1)`.
- `src/index.js` — wraps the top-level dispatch in a `try/catch`; on any
  uncaught exception it writes `Error: unexpected error — <e.message>` to
  stderr and exits with code 2.
- `src/store.js` — helper functions throw a plain `Error` (not `process.exit`)
  when an invariant is violated (e.g. `getTaskById` when the ID is missing),
  so callers can decide how to surface it.

### Consistency rules

- Never use `console.error` — always use `process.stderr.write` with a
  trailing newline so output is synchronous and predictable.
- Never use `console.log` for errors — success output goes to stdout only.
- Error messages use present tense and name the invalid value explicitly
  (e.g. `title cannot be empty`, not `invalid input`).

---

## 7. Input Validation Rules

All validation is centralised in `src/lib/validate.js` and returns
`{ ok: boolean, error?: string }`. No command module performs raw checks
inline.

### `title`

| Rule | Detail |
|------|--------|
| Required | Must be provided on `add`; the flag must not be absent or empty string. |
| Max length | ≤ 100 characters after trimming surrounding whitespace. |
| Type | Must be a non-empty string. |

### `description`

| Rule | Detail |
|------|--------|
| Optional | If omitted, stored as `""`. |
| Max length | ≤ 500 characters after trimming. |

### `status`

| Rule | Detail |
|------|--------|
| Allowed values | `"todo"`, `"in-progress"`, `"done"` (case-insensitive input, stored lowercase). |
| Required on update | If the `--status` flag is supplied its value must be one of the three allowed values. |

### `priority`

| Rule | Detail |
|------|--------|
| Allowed values | `"low"`, `"medium"`, `"high"` (case-insensitive input, stored lowercase). |
| Default | `"medium"` when omitted on `add`. |

### `id` (positional argument)

| Rule | Detail |
|------|--------|
| Must be numeric | Parsed with `Number(id)`; if the result is `NaN` or not a positive integer, the CLI prints an error and exits 1. |
| Must exist | After numeric validation, `store.getTaskById(id)` is called; a missing ID is a user error (exit 1). |

### `--sort` flag

| Rule | Detail |
|------|--------|
| Allowed values | `"priority"`, `"date"`. Any other value is rejected with exit 1. |

### General rules

- Leading and trailing whitespace is trimmed from all string inputs before
  validation and storage.
- Unknown flags are silently ignored in Phase 1–2 and will produce a warning
  in Phase 4.
- Validation always runs before any store mutation; a partially valid command
  never writes to the store.
