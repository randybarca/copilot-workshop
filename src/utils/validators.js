const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_FIELDS = ['priority', 'date'];
const CATEGORY_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates and normalises a task title.
 * @param {unknown} value - The value to validate.
 * @returns {string} The trimmed title.
 * @throws {TypeError} If value is not a non-empty string within 100 chars.
 * @example validateTitle('Buy milk') // => 'Buy milk'
 * @example validateTitle('  ') // throws TypeError: title must not be empty
 */
export function validateTitle(value) {
  if (typeof value !== 'string') throw new TypeError('title must be a string');
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new TypeError('title must not be empty');
  if (trimmed.length > 100) throw new TypeError('title must be 100 characters or fewer');
  return trimmed;
}

/**
 * Validates and normalises a task description.
 * @param {unknown} value - The value to validate.
 * @returns {string} The trimmed description, or '' if not provided.
 * @throws {TypeError} If value is not a string or exceeds 500 chars.
 * @example validateDescription('Some details') // => 'Some details'
 * @example validateDescription(undefined) // => ''
 */
export function validateDescription(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new TypeError('description must be a string');
  const trimmed = value.trim();
  if (trimmed.length > 500) throw new TypeError('description must be 500 characters or fewer');
  return trimmed;
}

/**
 * Validates and normalises a task status.
 * @param {unknown} value - The value to validate.
 * @returns {string} The lowercased status.
 * @throws {TypeError} If value is not one of: todo, in-progress, done.
 * @example validateStatus('TODO') // => 'todo'
 * @example validateStatus('invalid') // throws TypeError
 */
export function validateStatus(value) {
  if (typeof value !== 'string') throw new TypeError('status must be a string');
  const lower = value.trim().toLowerCase();
  if (!VALID_STATUSES.includes(lower)) {
    throw new TypeError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return lower;
}

/**
 * Validates and normalises a task priority.
 * @param {unknown} value - The value to validate.
 * @returns {string} The lowercased priority.
 * @throws {TypeError} If value is not one of: low, medium, high.
 * @example validatePriority('HIGH') // => 'high'
 * @example validatePriority('urgent') // throws TypeError
 */
export function validatePriority(value) {
  if (typeof value !== 'string') throw new TypeError('priority must be a string');
  const lower = value.trim().toLowerCase();
  if (!VALID_PRIORITIES.includes(lower)) {
    throw new TypeError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return lower;
}

/**
 * Validates a task ID (UUID string).
 * @param {unknown} value - The value to validate.
 * @returns {string} The validated ID.
 * @throws {TypeError} If value is not a non-empty string.
 * @example validateId('550e8400-e29b-41d4-a716-446655440000') // => '550e8400-...'
 * @example validateId(null) // throws TypeError: id must be a non-empty string
 */
export function validateId(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError('id must be a non-empty string');
  }
  return value.trim();
}

/**
 * Validates a task category.
 * @param {unknown} value - The value to validate.
 * @returns {string} The trimmed category, or 'general' if not provided.
 * @throws {TypeError} If value is not a string, exceeds 50 chars, or contains invalid characters.
 * @example validateCategory('work') // => 'work'
 * @example validateCategory('personal-2024') // => 'personal-2024'
 * @example validateCategory(undefined) // => 'general'
 */
export function validateCategory(value) {
  if (value === undefined || value === null) return 'general';
  if (typeof value !== 'string') throw new TypeError('category must be a string');
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'general';
  if (trimmed.length > 50) throw new TypeError('category must be 50 characters or fewer');
  if (!CATEGORY_REGEX.test(trimmed)) {
    throw new TypeError('category must contain only alphanumeric, dash, and underscore characters');
  }
  return trimmed;
}

/**
 * Validates a sort field name.
 * @param {unknown} value - The value to validate.
 * @returns {string} The lowercased sort field.
 * @throws {TypeError} If value is not one of: priority, date.
 * @example validateSort('priority') // => 'priority'
 * @example validateSort('name') // throws TypeError
 */
export function validateSort(value) {
  if (typeof value !== 'string') throw new TypeError('sort must be a string');
  const lower = value.trim().toLowerCase();
  if (!VALID_SORT_FIELDS.includes(lower)) {
    throw new TypeError(`sort must be one of: ${VALID_SORT_FIELDS.join(', ')}`);
  }
  return lower;
}
