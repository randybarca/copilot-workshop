import {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from './services/taskService.js';

// ── Create tasks ─────────────────────────────────────────────────────────────

console.log('=== Creating tasks ===');

const t1 = addTask({ title: 'Write unit tests', priority: 'high' });
console.log('Created:', t1);

const t2 = addTask({
  title: 'Update README',
  description: 'Add usage examples and installation steps.',
  status: 'in-progress',
  priority: 'medium',
});
console.log('Created:', t2);

const t3 = addTask({
  title: 'Fix login bug',
  description: 'Users cannot log in with OAuth on mobile.',
  status: 'todo',
  priority: 'high',
});
console.log('Created:', t3);

const t4 = addTask({
  title: 'Refactor database layer',
  description: 'Extract query helpers into a separate module.',
  priority: 'low',
});
console.log('Created:', t4);

// ── List all tasks ────────────────────────────────────────────────────────────

console.log('\n=== All tasks ===');
const all = getTasks();
console.log(`Total tasks: ${all.length}`);
all.forEach(t => console.log(`  [${t.priority.toUpperCase()}] ${t.title} — ${t.status}`));

// ── Filter by status ──────────────────────────────────────────────────────────

console.log('\n=== Filter by status: todo ===');
const todoTasks = getTasks({ status: 'todo' });
todoTasks.forEach(t => console.log(`  ${t.title}`));

// ── Filter by priority ────────────────────────────────────────────────────────

console.log('\n=== Filter by priority: high ===');
const highTasks = getTasks({ priority: 'high' });
highTasks.forEach(t => console.log(`  ${t.title}`));

// ── Sort by priority (high → low) ─────────────────────────────────────────────

console.log('\n=== Sort by priority ===');
const byPriority = getTasks({ sortBy: 'priority' });
byPriority.forEach(t => console.log(`  [${t.priority}] ${t.title}`));

// ── Sort by creation date ─────────────────────────────────────────────────────

console.log('\n=== Sort by creation date ===');
const byDate = getTasks({ sortBy: 'date' });
byDate.forEach(t => console.log(`  ${t.createdAt.slice(0, 19)}Z  ${t.title}`));

// ── Get a single task by ID ───────────────────────────────────────────────────

console.log('\n=== Get task by ID ===');
const fetched = getTaskById(t1.id);
console.log('Fetched:', fetched);

// ── Update a task ─────────────────────────────────────────────────────────────

console.log('\n=== Update task ===');
const updated = updateTask(t1.id, { status: 'in-progress', priority: 'medium' });
console.log('Updated:', updated);
console.log(`updatedAt changed: ${updated.updatedAt !== t1.updatedAt}`);

// ── Filter combined with sort ─────────────────────────────────────────────────

console.log('\n=== In-progress tasks sorted by priority ===');
const inProgress = getTasks({ status: 'in-progress', sortBy: 'priority' });
inProgress.forEach(t => console.log(`  [${t.priority}] ${t.title}`));

// ── Delete a task ─────────────────────────────────────────────────────────────

console.log('\n=== Delete task ===');
const deleted = deleteTask(t4.id);
console.log('Deleted:', deleted.title);
console.log(`Remaining tasks: ${getTasks().length}`);

// ── Error handling ────────────────────────────────────────────────────────────

console.log('\n=== Error handling ===');

try {
  addTask({ title: '' });
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

try {
  addTask({ title: 'Valid title', status: 'flying' });
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

try {
  getTaskById('non-existent-id');
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

try {
  deleteTask(deleted.id);
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

console.log('\nDone.');
