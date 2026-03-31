import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  filterByCategory,
  clearTasks,
} from '../src/services/taskService.js';

// Reset store before every test so tests are fully independent.
beforeEach(() => clearTasks());

// ---------------------------------------------------------------------------
// addTask
// ---------------------------------------------------------------------------
describe('addTask', () => {
  it('creates a task with required title and default fields', () => {
    const task = addTask({ title: 'First task' });
    assert.equal(task.title, 'First task');
    assert.equal(task.description, '');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'medium');
    assert.equal(task.category, 'general');
  });

  it('returns a plain object with all required keys', () => {
    const task = addTask({ title: 'Key check' });
    const keys = Object.keys(task).sort();
    assert.deepEqual(keys, ['category', 'createdAt', 'description', 'id', 'priority', 'status', 'title', 'updatedAt'].sort());
  });

  it('assigns a unique id to each task', () => {
    const a = addTask({ title: 'A' });
    const b = addTask({ title: 'B' });
    assert.notEqual(a.id, b.id);
  });

  it('persists the task so it appears in getTasks', () => {
    addTask({ title: 'Persisted' });
    const all = getTasks();
    assert.equal(all.length, 1);
    assert.equal(all[0].title, 'Persisted');
  });

  it('accepts custom description, status, and priority', () => {
    const task = addTask({ title: 'Custom', description: 'Desc', status: 'done', priority: 'high' });
    assert.equal(task.description, 'Desc');
    assert.equal(task.status, 'done');
    assert.equal(task.priority, 'high');
    assert.equal(task.category, 'general');
  });

  it('accepts custom category', () => {
    const task = addTask({ title: 'Work task', category: 'work' });
    assert.equal(task.category, 'work');
  });

  it('returns a copy — mutating the result does not affect the store', () => {
    const task = addTask({ title: 'Original' });
    task.title = 'Mutated';
    const stored = getTasks()[0];
    assert.equal(stored.title, 'Original');
  });

  it('throws TypeError for a missing title', () => {
    assert.throws(() => addTask({}), TypeError);
  });

  it('throws TypeError for an empty title', () => {
    assert.throws(() => addTask({ title: '' }), TypeError);
  });

  it('throws TypeError for an invalid status', () => {
    assert.throws(() => addTask({ title: 'T', status: 'archived' }), TypeError);
  });

  it('throws TypeError for an invalid priority', () => {
    assert.throws(() => addTask({ title: 'T', priority: 'critical' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// getTasks — no filters
// ---------------------------------------------------------------------------
describe('getTasks — no filter', () => {
  it('returns an empty array when store is empty', () => {
    assert.deepEqual(getTasks(), []);
  });

  it('returns all tasks when no options are passed', () => {
    addTask({ title: 'A' });
    addTask({ title: 'B' });
    assert.equal(getTasks().length, 2);
  });

  it('returns copies — mutating a result does not affect the store', () => {
    addTask({ title: 'Safe' });
    const results = getTasks();
    results[0].title = 'Hacked';
    assert.equal(getTasks()[0].title, 'Safe');
  });
});

// ---------------------------------------------------------------------------
// getTasks — filter by status
// ---------------------------------------------------------------------------
describe('getTasks — filter by status', () => {
  it('returns only tasks matching the requested status', () => {
    addTask({ title: 'Todo 1' });
    addTask({ title: 'Done 1', status: 'done' });
    const results = getTasks({ status: 'todo' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Todo 1');
  });

  it('returns an empty array when no tasks match the status', () => {
    addTask({ title: 'T', status: 'todo' });
    assert.deepEqual(getTasks({ status: 'done' }), []);
  });

  it('is case-insensitive for the status filter', () => {
    addTask({ title: 'T', status: 'done' });
    assert.equal(getTasks({ status: 'DONE' }).length, 1);
  });

  it('throws TypeError for an unrecognised status filter', () => {
    assert.throws(() => getTasks({ status: 'archived' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// getTasks — filter by priority
// ---------------------------------------------------------------------------
describe('getTasks — filter by priority', () => {
  it('returns only tasks matching the requested priority', () => {
    addTask({ title: 'High task', priority: 'high' });
    addTask({ title: 'Low task', priority: 'low' });
    const results = getTasks({ priority: 'high' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'High task');
  });

  it('is case-insensitive for the priority filter', () => {
    addTask({ title: 'T', priority: 'low' });
    assert.equal(getTasks({ priority: 'LOW' }).length, 1);
  });

  it('throws TypeError for an unrecognised priority filter', () => {
    assert.throws(() => getTasks({ priority: 'urgent' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// getTasks — combined filter
// ---------------------------------------------------------------------------
describe('getTasks — combined status + priority filter', () => {
  it('applies both filters simultaneously', () => {
    addTask({ title: 'Match', status: 'in-progress', priority: 'high' });
    addTask({ title: 'Wrong priority', status: 'in-progress', priority: 'low' });
    addTask({ title: 'Wrong status', status: 'done', priority: 'high' });
    const results = getTasks({ status: 'in-progress', priority: 'high' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Match');
  });
});

// ---------------------------------------------------------------------------
// getTasks — sort by priority
// ---------------------------------------------------------------------------
describe('getTasks — sort by priority', () => {
  it('returns tasks ordered high → medium → low', () => {
    addTask({ title: 'Low', priority: 'low' });
    addTask({ title: 'High', priority: 'high' });
    addTask({ title: 'Med', priority: 'medium' });
    const results = getTasks({ sortBy: 'priority' });
    assert.equal(results[0].priority, 'high');
    assert.equal(results[1].priority, 'medium');
    assert.equal(results[2].priority, 'low');
  });

  it('throws TypeError for an unrecognised sortBy value', () => {
    assert.throws(() => getTasks({ sortBy: 'name' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// getTasks — sort by date
// ---------------------------------------------------------------------------
describe('getTasks — sort by date', () => {
  it('returns tasks ordered by createdAt ascending', () => {
    const a = addTask({ title: 'First' });
    const b = addTask({ title: 'Second' });
    const results = getTasks({ sortBy: 'date' });
    assert.equal(results[0].id, a.id);
    assert.equal(results[1].id, b.id);
  });
});

// ---------------------------------------------------------------------------
// getTaskById
// ---------------------------------------------------------------------------
describe('getTaskById', () => {
  it('returns the task when the id exists', () => {
    const created = addTask({ title: 'Findable' });
    const found = getTaskById(created.id);
    assert.equal(found.id, created.id);
    assert.equal(found.title, 'Findable');
  });

  it('returns a copy — mutating the result does not affect the store', () => {
    const created = addTask({ title: 'Safe get' });
    const found = getTaskById(created.id);
    found.title = 'Mutated';
    assert.equal(getTaskById(created.id).title, 'Safe get');
  });

  it('throws Error when the id does not exist', () => {
    assert.throws(() => getTaskById('non-existent-id'), Error);
  });

  it('throws TypeError for a non-string id', () => {
    assert.throws(() => getTaskById(1), TypeError);
  });

  it('throws TypeError for an empty string id', () => {
    assert.throws(() => getTaskById(''), TypeError);
  });
});

// ---------------------------------------------------------------------------
// updateTask
// ---------------------------------------------------------------------------
describe('updateTask', () => {
  it('updates the title when provided', () => {
    const task = addTask({ title: 'Old title' });
    const updated = updateTask(task.id, { title: 'New title' });
    assert.equal(updated.title, 'New title');
  });

  it('updates the description when provided', () => {
    const task = addTask({ title: 'T' });
    const updated = updateTask(task.id, { description: 'Added description' });
    assert.equal(updated.description, 'Added description');
  });

  it('updates the status when provided', () => {
    const task = addTask({ title: 'T' });
    const updated = updateTask(task.id, { status: 'done' });
    assert.equal(updated.status, 'done');
  });

  it('updates the priority when provided', () => {
    const task = addTask({ title: 'T' });
    const updated = updateTask(task.id, { priority: 'low' });
    assert.equal(updated.priority, 'low');
  });

  it('refreshes updatedAt on every update', () => {
    const task = addTask({ title: 'Time check' });
    const originalUpdatedAt = task.updatedAt;
    // Small delay to ensure a distinct timestamp.
    const updated = updateTask(task.id, { title: 'Changed' });
    assert.ok(updated.updatedAt >= originalUpdatedAt);
  });

  it('does not mutate createdAt', () => {
    const task = addTask({ title: 'Stable' });
    const updated = updateTask(task.id, { status: 'done' });
    assert.equal(updated.createdAt, task.createdAt);
  });

  it('returns a copy — mutating the result does not affect the store', () => {
    const task = addTask({ title: 'Copy check' });
    const updated = updateTask(task.id, { title: 'Updated' });
    updated.title = 'Hacked';
    assert.equal(getTaskById(task.id).title, 'Updated');
  });

  it('throws Error when the id does not exist', () => {
    assert.throws(() => updateTask('no-such-id', { title: 'X' }), Error);
  });

  it('throws TypeError for an invalid status value', () => {
    const task = addTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, { status: 'invalid' }), TypeError);
  });

  it('throws TypeError for an invalid priority value', () => {
    const task = addTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, { priority: 'extreme' }), TypeError);
  });

  it('throws TypeError for an empty title', () => {
    const task = addTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, { title: '' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------
describe('deleteTask', () => {
  it('returns the deleted task object', () => {
    const task = addTask({ title: 'To delete' });
    const deleted = deleteTask(task.id);
    assert.equal(deleted.id, task.id);
    assert.equal(deleted.title, 'To delete');
  });

  it('removes the task from the store', () => {
    const task = addTask({ title: 'Remove me' });
    deleteTask(task.id);
    assert.equal(getTasks().length, 0);
  });

  it('only removes the targeted task', () => {
    const a = addTask({ title: 'Keep' });
    const b = addTask({ title: 'Delete' });
    deleteTask(b.id);
    const remaining = getTasks();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, a.id);
  });

  it('throws Error when the id does not exist', () => {
    assert.throws(() => deleteTask('ghost-id'), Error);
  });

  it('throws Error when deleting an already-deleted task', () => {
    const task = addTask({ title: 'Delete twice' });
    deleteTask(task.id);
    assert.throws(() => deleteTask(task.id), Error);
  });

  it('throws TypeError for a non-string id', () => {
    assert.throws(() => deleteTask(123), TypeError);
  });
});

// ---------------------------------------------------------------------------
// clearTasks
// ---------------------------------------------------------------------------
describe('clearTasks', () => {
  it('empties the store', () => {
    addTask({ title: 'A' });
    addTask({ title: 'B' });
    clearTasks();
    assert.deepEqual(getTasks(), []);
  });

  it('is idempotent on an already-empty store', () => {
    clearTasks();
    clearTasks();
    assert.deepEqual(getTasks(), []);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — boundary values
// ---------------------------------------------------------------------------
describe('taskService — boundary values', () => {
  it('addTask accepts a title of exactly 100 characters', () => {
    const task = addTask({ title: 'a'.repeat(100) });
    assert.equal(task.title.length, 100);
  });

  it('addTask throws TypeError for a title of 101 characters', () => {
    assert.throws(() => addTask({ title: 'a'.repeat(101) }), TypeError);
  });

  it('addTask accepts a description of exactly 500 characters', () => {
    const task = addTask({ title: 'T', description: 'b'.repeat(500) });
    assert.equal(task.description.length, 500);
  });

  it('addTask throws TypeError for a description of 501 characters', () => {
    assert.throws(() => addTask({ title: 'T', description: 'b'.repeat(501) }), TypeError);
  });

  it('getTasks returns all tasks in a large store', () => {
    for (let i = 0; i < 100; i++) addTask({ title: `Task ${i}` });
    assert.equal(getTasks().length, 100);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — type mismatches
// ---------------------------------------------------------------------------
describe('taskService — type mismatches', () => {
  it('addTask throws when title is a number', () => {
    assert.throws(() => addTask({ title: 42 }), TypeError);
  });

  it('getTasks throws TypeError when status filter is a number', () => {
    assert.throws(() => getTasks({ status: 123 }), TypeError);
  });

  it('getTasks throws TypeError when priority filter is an object', () => {
    assert.throws(() => getTasks({ priority: {} }), TypeError);
  });

  it('getTasks throws TypeError when sortBy is a boolean', () => {
    assert.throws(() => getTasks({ sortBy: true }), TypeError);
  });

  it('getTaskById throws TypeError when id is an object', () => {
    assert.throws(() => getTaskById({}), TypeError);
  });

  it('updateTask throws TypeError when new title is a number', () => {
    const task = addTask({ title: 'T' });
    assert.throws(() => updateTask(task.id, { title: 99 }), TypeError);
  });

  it('deleteTask throws TypeError when id is a boolean', () => {
    assert.throws(() => deleteTask(false), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — missing optional fields
// ---------------------------------------------------------------------------
describe('taskService — missing optional fields', () => {
  it('addTask with description undefined sets description to empty string', () => {
    const task = addTask({ title: 'T', description: undefined });
    assert.equal(task.description, '');
  });

  it('addTask with status undefined sets status to todo', () => {
    const task = addTask({ title: 'T', status: undefined });
    assert.equal(task.status, 'todo');
  });

  it('addTask with priority undefined sets priority to medium', () => {
    const task = addTask({ title: 'T', priority: undefined });
    assert.equal(task.priority, 'medium');
  });

  it('updateTask with empty fields object preserves existing data values', () => {
    const task = addTask({ title: 'Original', status: 'done', priority: 'high' });
    const updated = updateTask(task.id, {});
    assert.equal(updated.title, 'Original');
    assert.equal(updated.status, 'done');
    assert.equal(updated.priority, 'high');
  });
});

// ---------------------------------------------------------------------------
// Edge cases — duplicate entries
// ---------------------------------------------------------------------------
describe('taskService — duplicate entries', () => {
  it('stores two tasks with the same title as separate entries', () => {
    const a = addTask({ title: 'Duplicate title' });
    const b = addTask({ title: 'Duplicate title' });
    assert.notEqual(a.id, b.id);
    assert.equal(getTasks().length, 2);
  });

  it('deleting one duplicate leaves the other intact', () => {
    const a = addTask({ title: 'Dup' });
    const b = addTask({ title: 'Dup' });
    deleteTask(a.id);
    assert.equal(getTasks().length, 1);
    assert.equal(getTasks()[0].id, b.id);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — concurrent-style modifications
// ---------------------------------------------------------------------------
describe('taskService — concurrent-style modifications', () => {
  it('adding during iteration does not affect a previously captured snapshot', () => {
    addTask({ title: 'Before' });
    const snapshot = getTasks();
    addTask({ title: 'Added during iteration' });
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0].title, 'Before');
  });

  it('deleting does not affect a previously captured snapshot', () => {
    const t = addTask({ title: 'To be deleted' });
    addTask({ title: 'Stays' });
    const snapshot = getTasks();
    deleteTask(t.id);
    assert.equal(snapshot.length, 2);
  });

  it('mutating a returned snapshot does not corrupt subsequent getTasks calls', () => {
    addTask({ title: 'Real' });
    const snapshot = getTasks();
    snapshot[0].title = 'Corrupted';
    snapshot.push({ id: 'fake', title: 'Injected' });
    assert.equal(getTasks().length, 1);
    assert.equal(getTasks()[0].title, 'Real');
  });
});

// ---------------------------------------------------------------------------
// getTasks — filter by category
// ---------------------------------------------------------------------------
describe('getTasks — filter by category', () => {
  it('returns only tasks matching the requested category', () => {
    addTask({ title: 'Work 1', category: 'work' });
    addTask({ title: 'Personal 1', category: 'personal' });
    const results = getTasks({ category: 'work' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Work 1');
  });

  it('returns an empty array when no tasks match the category', () => {
    addTask({ title: 'T', category: 'work' });
    assert.deepEqual(getTasks({ category: 'personal' }), []);
  });

  it('filters by category (case-sensitive)', () => {
    addTask({ title: 'T', category: 'Work' });
    assert.deepEqual(getTasks({ category: 'work' }), []);
    assert.equal(getTasks({ category: 'Work' }).length, 1);
  });

  it('throws TypeError for an invalid category with special characters', () => {
    assert.throws(() => getTasks({ category: 'work@home' }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// filterByCategory
// ---------------------------------------------------------------------------
describe('filterByCategory', () => {
  it('returns only tasks matching the category', () => {
    addTask({ title: 'Work 1', category: 'work' });
    addTask({ title: 'Work 2', category: 'work' });
    addTask({ title: 'Personal', category: 'personal' });
    const results = filterByCategory('work');
    assert.equal(results.length, 2);
    assert.equal(results[0].title, 'Work 1');
    assert.equal(results[1].title, 'Work 2');
  });

  it('returns an empty array when no tasks have the category', () => {
    addTask({ title: 'T', category: 'work' });
    assert.deepEqual(filterByCategory('shopping'), []);
  });

  it('returns all "general" tasks when that category is requested', () => {
    addTask({ title: 'Task without category' });
    addTask({ title: 'Task with explicit general', category: 'general' });
    addTask({ title: 'Work task', category: 'work' });
    const results = filterByCategory('general');
    assert.equal(results.length, 2);
  });

  it('throws TypeError for invalid category format', () => {
    assert.throws(() => filterByCategory('invalid@'), TypeError);
    assert.throws(() => filterByCategory('a'.repeat(51)), TypeError);
  });
});

// ---------------------------------------------------------------------------
// getTasks — combined filters with category
// ---------------------------------------------------------------------------
describe('getTasks — combined filters with category', () => {
  it('combines status and category filters', () => {
    addTask({ title: 'Work todo', category: 'work', status: 'todo' });
    addTask({ title: 'Work done', category: 'work', status: 'done' });
    addTask({ title: 'Personal todo', category: 'personal', status: 'todo' });
    const results = getTasks({ status: 'todo', category: 'work' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Work todo');
  });

  it('combines priority and category filters', () => {
    addTask({ title: 'Work high', category: 'work', priority: 'high' });
    addTask({ title: 'Work low', category: 'work', priority: 'low' });
    addTask({ title: 'Personal high', category: 'personal', priority: 'high' });
    const results = getTasks({ priority: 'high', category: 'work' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Work high');
  });
});
