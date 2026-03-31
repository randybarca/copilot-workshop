import { randomUUID } from 'node:crypto';
import {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
} from '../utils/validators.js';

/**
 * Represents a task in the Task Manager application.
 */
export class Task {
  /**
   * Creates a new Task instance with a generated UUID and timestamps.
   * @param {string} title - The task title (required, non-empty, ≤ 100 chars).
   * @param {object} [options] - Optional task properties.
   * @param {string} [options.description] - Task description (≤ 500 chars).
   * @param {string} [options.status='todo'] - Task status: todo, in-progress, or done.
   * @param {string} [options.priority='medium'] - Task priority: low, medium, or high.
   * @throws {TypeError} If any argument fails validation.
   */
  constructor(title, { description, status, priority } = {}) {
    this.id = randomUUID();
    this.title = validateTitle(title);
    this.description = validateDescription(description);
    this.status = validateStatus(status ?? 'todo');
    this.priority = validatePriority(priority ?? 'medium');
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }

  /**
   * Returns a plain object representation of this task.
   * @returns {{ id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string }}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
