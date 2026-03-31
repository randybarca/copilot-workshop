import chalk from 'chalk';

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Returns a colorized status label.
 * @param {unknown} status - The task status to colorize.
 * @returns {string} A chalk-formatted status value.
 * @throws {TypeError} If status is not one of todo, in-progress, done.
 * @example colorStatus('done') // => chalk.green('done')
 * @example colorStatus('todo') // => chalk.red('todo')
 */
export function colorStatus(status) {
  if (typeof status !== 'string') {
    throw new TypeError('status must be a string');
  }

  const value = status.trim().toLowerCase();
  if (!VALID_STATUSES.includes(value)) {
    throw new TypeError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (value === 'done') return chalk.green(value);
  if (value === 'in-progress') return chalk.yellow(value);
  return chalk.red(value);
}

/**
 * Returns a colorized priority label.
 * @param {unknown} priority - The task priority to colorize.
 * @returns {string} A chalk-formatted priority value.
 * @throws {TypeError} If priority is not one of low, medium, high.
 * @example colorPriority('high') // => chalk.bold.red('high')
 * @example colorPriority('low') // => chalk.dim('low')
 */
export function colorPriority(priority) {
  if (typeof priority !== 'string') {
    throw new TypeError('priority must be a string');
  }

  const value = priority.trim().toLowerCase();
  if (!VALID_PRIORITIES.includes(value)) {
    throw new TypeError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (value === 'high') return chalk.bold.red(value);
  if (value === 'medium') return chalk.bold.yellow(value);
  return chalk.dim(value);
}