import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

// ---------------------------------------------------------------------------
// Constructor — success paths
// ---------------------------------------------------------------------------
describe('Task constructor', () => {
  it('creates a task with required title and sensible defaults', () => {
    const task = new Task('Write tests');
    assert.equal(task.title, 'Write tests');
    assert.equal(task.description, '');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'medium');
  });

  it('assigns a non-empty string UUID as id', () => {
    const task = new Task('Sample');
    assert.equal(typeof task.id, 'string');
    assert.ok(task.id.length > 0);
  });

  it('generates unique ids for different instances', () => {
    const a = new Task('A');
    const b = new Task('B');
    assert.notEqual(a.id, b.id);
  });

  it('sets createdAt and updatedAt to ISO 8601 strings', () => {
    const before = new Date().toISOString();
    const task = new Task('Timed task');
    const after = new Date().toISOString();
    assert.ok(task.createdAt >= before);
    assert.ok(task.createdAt <= after);
    assert.equal(task.createdAt, task.updatedAt);
  });

  it('trims the title', () => {
    const task = new Task('  Padded  ');
    assert.equal(task.title, 'Padded');
  });

  it('accepts a custom description', () => {
    const task = new Task('T', { description: 'Details here' });
    assert.equal(task.description, 'Details here');
  });

  it('trims the description', () => {
    const task = new Task('T', { description: '  trimmed  ' });
    assert.equal(task.description, 'trimmed');
  });

  it('accepts a custom status', () => {
    const task = new Task('T', { status: 'done' });
    assert.equal(task.status, 'done');
  });

  it('normalises status to lowercase', () => {
    const task = new Task('T', { status: 'IN-PROGRESS' });
    assert.equal(task.status, 'in-progress');
  });

  it('accepts a custom priority', () => {
    const task = new Task('T', { priority: 'high' });
    assert.equal(task.priority, 'high');
  });

  it('normalises priority to lowercase', () => {
    const task = new Task('T', { priority: 'LOW' });
    assert.equal(task.priority, 'low');
  });
});

// ---------------------------------------------------------------------------
// Constructor — validation errors
// ---------------------------------------------------------------------------
describe('Task constructor — invalid inputs', () => {
  it('throws TypeError for a missing title', () => {
    assert.throws(() => new Task(), TypeError);
  });

  it('throws TypeError for an empty title', () => {
    assert.throws(() => new Task(''), TypeError);
  });

  it('throws TypeError for a whitespace-only title', () => {
    assert.throws(() => new Task('   '), TypeError);
  });

  it('throws TypeError for a title exceeding 100 characters', () => {
    assert.throws(() => new Task('x'.repeat(101)), TypeError);
  });

  it('throws TypeError for a description exceeding 500 characters', () => {
    assert.throws(() => new Task('T', { description: 'y'.repeat(501) }), TypeError);
  });

  it('throws TypeError for an invalid status', () => {
    assert.throws(() => new Task('T', { status: 'archived' }), TypeError);
  });

  it('throws TypeError for an invalid priority', () => {
    assert.throws(() => new Task('T', { priority: 'critical' }), TypeError);
  });

  it('throws TypeError when title is a number', () => {
    assert.throws(() => new Task(42), TypeError);
  });
});

// ---------------------------------------------------------------------------
// toJSON
// ---------------------------------------------------------------------------
describe('Task.toJSON', () => {
  it('returns a plain object with all required keys', () => {
    const task = new Task('Buy groceries', { description: 'Milk and bread', status: 'todo', priority: 'low' });
    const json = task.toJSON();
    assert.deepEqual(Object.keys(json).sort(), ['createdAt', 'description', 'id', 'priority', 'status', 'title', 'updatedAt'].sort());
  });

  it('values in toJSON match the instance properties', () => {
    const task = new Task('Run linter', { status: 'in-progress', priority: 'high' });
    const json = task.toJSON();
    assert.equal(json.id, task.id);
    assert.equal(json.title, task.title);
    assert.equal(json.description, task.description);
    assert.equal(json.status, task.status);
    assert.equal(json.priority, task.priority);
    assert.equal(json.createdAt, task.createdAt);
    assert.equal(json.updatedAt, task.updatedAt);
  });

  it('returns a copy — mutating the result does not affect the instance', () => {
    const task = new Task('Immutable test');
    const json = task.toJSON();
    json.title = 'Modified';
    assert.equal(task.title, 'Immutable test');
  });
});

// ---------------------------------------------------------------------------
// Edge cases — boundary values
// ---------------------------------------------------------------------------
describe('Task constructor — boundary values', () => {
  it('accepts a title of exactly 1 character (minimum boundary)', () => {
    const task = new Task('X');
    assert.equal(task.title, 'X');
  });

  it('accepts a title of exactly 100 characters (maximum boundary)', () => {
    const title = 'a'.repeat(100);
    const task = new Task(title);
    assert.equal(task.title, title);
  });

  it('rejects a title of 101 characters (one over maximum)', () => {
    assert.throws(() => new Task('a'.repeat(101)), TypeError);
  });

  it('accepts a description of exactly 500 characters (maximum boundary)', () => {
    const desc = 'b'.repeat(500);
    const task = new Task('T', { description: desc });
    assert.equal(task.description, desc);
  });

  it('rejects a description of 501 characters (one over maximum)', () => {
    assert.throws(() => new Task('T', { description: 'b'.repeat(501) }), TypeError);
  });

  it('title trimmed to 100 characters is accepted after trimming', () => {
    const padded = '  ' + 'a'.repeat(100) + '  ';
    const task = new Task(padded);
    assert.equal(task.title.length, 100);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — type mismatches
// ---------------------------------------------------------------------------
describe('Task constructor — type mismatches', () => {
  it('throws TypeError when title is a boolean', () => {
    assert.throws(() => new Task(true), TypeError);
  });

  it('throws TypeError when title is an array', () => {
    assert.throws(() => new Task(['task']), TypeError);
  });

  it('throws TypeError when title is a plain object', () => {
    assert.throws(() => new Task({ title: 'T' }), TypeError);
  });

  it('throws TypeError when status is a boolean (false is not nullish)', () => {
    assert.throws(() => new Task('T', { status: false }), TypeError);
  });

  it('throws TypeError when priority is a number', () => {
    assert.throws(() => new Task('T', { priority: 1 }), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — missing optional fields and defaults
// ---------------------------------------------------------------------------
describe('Task constructor — missing optional fields', () => {
  it('null description in options defaults to empty string', () => {
    const task = new Task('T', { description: null });
    assert.equal(task.description, '');
  });

  it('null status in options defaults to "todo" (nullish coalescing)', () => {
    const task = new Task('T', { status: null });
    assert.equal(task.status, 'todo');
  });

  it('null priority in options defaults to "medium" (nullish coalescing)', () => {
    const task = new Task('T', { priority: null });
    assert.equal(task.priority, 'medium');
  });

  it('options object with no keys yields all defaults', () => {
    const task = new Task('T', {});
    assert.equal(task.description, '');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'medium');
  });
});

// ---------------------------------------------------------------------------
// Edge cases — duplicate entries
// ---------------------------------------------------------------------------
describe('Task constructor — duplicate entries', () => {
  it('two tasks with the same title are distinct instances', () => {
    const a = new Task('Same title');
    const b = new Task('Same title');
    assert.notEqual(a.id, b.id);
  });

  it('two tasks with identical fields still have unique ids', () => {
    const opts = { description: 'Same', status: 'done', priority: 'high' };
    const a = new Task('Dup', opts);
    const b = new Task('Dup', opts);
    assert.notEqual(a.id, b.id);
  });
});
