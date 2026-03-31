import { Task } from '../models/task.js';
import {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateId,
  validateSort,
} from '../utils/validators.js';

/** @type {Task[]} */
let tasks = [];

const PRIORITY_ORDER = { low: 0, medium: 1, high: 2 };

/**
 * Adds a new task to the in-memory store.
 * @param {{ title: string, description?: string, status?: string, priority?: string }} fields
 * @returns {{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }}
 * @throws {TypeError} If required fields are missing or any field value is invalid.
 */
export function addTask(fields) {
  const task = new Task(fields.title, {
    description: fields.description,
    status: fields.status,
    priority: fields.priority,
  });
  tasks.push(task);
  return { ...task.toJSON() };
}

/**
 * Returns all tasks, with optional filtering and sorting.
 * @param {{ status?: string, priority?: string, sortBy?: string }} [options]
 * @returns {Array<{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }>}
 * @throws {TypeError} If any filter or sort value is invalid.
 */
export function getTasks({ status, priority, sortBy } = {}) {
  let result = tasks.map(t => ({ ...t.toJSON() }));

  if (status !== undefined) {
    const normalised = validateStatus(status);
    result = result.filter(t => t.status === normalised);
  }

  if (priority !== undefined) {
    const normalised = validatePriority(priority);
    result = result.filter(t => t.priority === normalised);
  }

  if (sortBy !== undefined) {
    const field = validateSort(sortBy);
    if (field === 'priority') {
      result.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
    } else {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  }

  return result;
}

/**
 * Returns a single task by ID.
 * @param {string} id - The task UUID.
 * @returns {{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }}
 * @throws {TypeError} If id is not a valid non-empty string.
 * @throws {Error} If no task with that ID exists.
 */
export function getTaskById(id) {
  const validId = validateId(id);
  const task = tasks.find(t => t.id === validId);
  if (!task) throw new Error(`Task ${validId} not found`);
  return { ...task.toJSON() };
}

/**
 * Updates an existing task by ID with the provided fields.
 * @param {string} id - The task UUID.
 * @param {{ title?: string, description?: string, status?: string, priority?: string }} fields
 * @returns {{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }}
 * @throws {TypeError} If id or any supplied field value is invalid.
 * @throws {Error} If no task with that ID exists.
 */
export function updateTask(id, fields) {
  const validId = validateId(id);
  const task = tasks.find(t => t.id === validId);
  if (!task) throw new Error(`Task ${validId} not found`);

  if (fields.title !== undefined) task.title = validateTitle(fields.title);
  if (fields.description !== undefined) task.description = validateDescription(fields.description);
  if (fields.status !== undefined) task.status = validateStatus(fields.status);
  if (fields.priority !== undefined) task.priority = validatePriority(fields.priority);
  task.updatedAt = new Date().toISOString();

  return { ...task.toJSON() };
}

/**
 * Deletes a task by ID and returns the deleted task.
 * @param {string} id - The task UUID.
 * @returns {{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }}
 * @throws {TypeError} If id is not a valid non-empty string.
 * @throws {Error} If no task with that ID exists.
 */
export function deleteTask(id) {
  const validId = validateId(id);
  const index = tasks.findIndex(t => t.id === validId);
  if (index === -1) throw new Error(`Task ${validId} not found`);
  const [task] = tasks.splice(index, 1);
  return { ...task.toJSON() };
}

/**
 * Removes all tasks from the store. Intended for use in tests.
 */
export function clearTasks() {
  tasks = [];
}
