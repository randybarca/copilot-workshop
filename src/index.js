import {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  filterByCategory,
} from './services/taskService.js';
import { colorStatus, colorPriority } from './utils/colors.js';

/**
 * Formats a task for CLI output with colored status and priority.
 * @param {{ title: string, status: string, priority: string }} task
 * @returns {string} A formatted task line.
 */
function formatTask(task) {
  return `  [${colorPriority(task.priority)}] ${task.title} - ${colorStatus(task.status)}`;
}

// ── Create tasks ─────────────────────────────────────────────────────────────

console.log('=== Creating tasks ===');

const t1 = addTask({ title: 'Write unit tests', priority: 'high', category: 'work' });
console.log('Created:', t1);

const t2 = addTask({
  title: 'Update README',
  description: 'Add usage examples and installation steps.',
  status: 'in-progress',
  priority: 'medium',
  category: 'work',
});
console.log('Created:', t2);

const t3 = addTask({
  title: 'Fix login bug',
  description: 'Users cannot log in with OAuth on mobile.',
  status: 'todo',
  priority: 'high',
  category: 'urgent',
});
console.log('Created:', t3);

const t4 = addTask({
  title: 'Refactor database layer',
  description: 'Extract query helpers into a separate module.',
  priority: 'low',
  category: 'personal',
});
console.log('Created:', t4);

const t5 = addTask({
  title: 'Buy groceries',
  category: 'shopping',
});
console.log('Created:', t5);

// ── List all tasks ────────────────────────────────────────────────────────────

console.log('\n=== All tasks ===');
const all = getTasks();
console.log(`Total tasks: ${all.length}`);
all.forEach(t => console.log(formatTask(t)));

// ── Filter by status ──────────────────────────────────────────────────────────

console.log('\n=== Filter by status: todo ===');
const todoTasks = getTasks({ status: 'todo' });
todoTasks.forEach(t => console.log(`  ${t.title}`));

// ── Filter by priority ────────────────────────────────────────────────────────

console.log('\n=== Filter by priority: high ===');
const highTasks = getTasks({ priority: 'high' });
highTasks.forEach(t => console.log(`  ${t.title}`));
// ── Filter by category ────────────────────────────────────────────────────────

console.log('\n=== Filter by category: work ===');
const workTasks = filterByCategory('work');
workTasks.forEach(t => console.log(`  ${t.title} (${t.category})`));
// ── Sort by priority (high → low) ─────────────────────────────────────────────

console.log('\n=== Sort by priority ===');
const byPriority = getTasks({ sortBy: 'priority' });
byPriority.forEach(t => console.log(formatTask(t)));

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

// ── Update category ───────────────────────────────────────────────────────────

console.log('\n=== Update category ===');
const categoryUpdated = updateTask(t4.id, { category: 'work' });
console.log('Updated category:', categoryUpdated.category);

// ── Filter combined with sort ─────────────────────────────────────────────────

console.log('\n=== In-progress tasks sorted by priority ===');
const inProgress = getTasks({ status: 'in-progress', sortBy: 'priority' });
inProgress.forEach(t => console.log(formatTask(t)));

// ── Delete a task ─────────────────────────────────────────────────────────────

console.log('\n=== Delete task ===');
const deleted = deleteTask(t5.id);
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

try {
  addTask({ title: 'Test', category: 'invalid@category' });
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

try {
  addTask({ title: 'Test', category: 'a'.repeat(51) });
} catch (err) {
  console.error(`Caught expected error: ${err.message}`);
}

console.log('\nDone.');
