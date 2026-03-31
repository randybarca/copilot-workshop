import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateCategory,
  validateId,
  validateSort,
} from '../src/utils/validators.js';

// ---------------------------------------------------------------------------
// validateTitle
// ---------------------------------------------------------------------------
describe('validateTitle', () => {
  it('returns trimmed title for a valid string', () => {
    assert.equal(validateTitle('  Buy milk  '), 'Buy milk');
  });

  it('returns title unchanged when no surrounding whitespace', () => {
    assert.equal(validateTitle('Fix bug'), 'Fix bug');
  });

  it('accepts a title of exactly 100 characters', () => {
    const title = 'a'.repeat(100);
    assert.equal(validateTitle(title), title);
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validateTitle(42), TypeError);
  });

  it('throws TypeError when value is null', () => {
    assert.throws(() => validateTitle(null), TypeError);
  });

  it('throws TypeError when value is undefined', () => {
    assert.throws(() => validateTitle(undefined), TypeError);
  });

  it('throws TypeError for an empty string', () => {
    assert.throws(() => validateTitle(''), TypeError);
  });

  it('throws TypeError for a whitespace-only string', () => {
    assert.throws(() => validateTitle('   '), TypeError);
  });

  it('throws TypeError for a title exceeding 100 characters', () => {
    assert.throws(() => validateTitle('a'.repeat(101)), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateDescription
// ---------------------------------------------------------------------------
describe('validateDescription', () => {
  it('returns trimmed description for a valid string', () => {
    assert.equal(validateDescription('  Some detail  '), 'Some detail');
  });

  it('returns empty string for undefined', () => {
    assert.equal(validateDescription(undefined), '');
  });

  it('returns empty string for null', () => {
    assert.equal(validateDescription(null), '');
  });

  it('returns empty string for empty string input', () => {
    assert.equal(validateDescription(''), '');
  });

  it('accepts a description of exactly 500 characters', () => {
    const desc = 'b'.repeat(500);
    assert.equal(validateDescription(desc), desc);
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validateDescription(99), TypeError);
  });

  it('throws TypeError for a description exceeding 500 characters', () => {
    assert.throws(() => validateDescription('x'.repeat(501)), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateStatus
// ---------------------------------------------------------------------------
describe('validateStatus', () => {
  it('returns "todo" for lowercase input', () => {
    assert.equal(validateStatus('todo'), 'todo');
  });

  it('returns "in-progress" for lowercase input', () => {
    assert.equal(validateStatus('in-progress'), 'in-progress');
  });

  it('returns "done" for lowercase input', () => {
    assert.equal(validateStatus('done'), 'done');
  });

  it('normalises uppercase input to lowercase', () => {
    assert.equal(validateStatus('TODO'), 'todo');
  });

  it('normalises mixed-case input to lowercase', () => {
    assert.equal(validateStatus('In-Progress'), 'in-progress');
  });

  it('trims surrounding whitespace before validating', () => {
    assert.equal(validateStatus('  done  '), 'done');
  });

  it('throws TypeError for an unrecognised status', () => {
    assert.throws(() => validateStatus('pending'), TypeError);
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validateStatus(1), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validatePriority
// ---------------------------------------------------------------------------
describe('validatePriority', () => {
  it('returns "low" for lowercase input', () => {
    assert.equal(validatePriority('low'), 'low');
  });

  it('returns "medium" for lowercase input', () => {
    assert.equal(validatePriority('medium'), 'medium');
  });

  it('returns "high" for lowercase input', () => {
    assert.equal(validatePriority('high'), 'high');
  });

  it('normalises uppercase input to lowercase', () => {
    assert.equal(validatePriority('HIGH'), 'high');
  });

  it('trims surrounding whitespace before validating', () => {
    assert.equal(validatePriority('  medium  '), 'medium');
  });

  it('throws TypeError for an unrecognised priority', () => {
    assert.throws(() => validatePriority('urgent'), TypeError);
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validatePriority(true), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateId
// ---------------------------------------------------------------------------
describe('validateId', () => {
  it('returns a valid UUID string unchanged', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    assert.equal(validateId(id), id);
  });

  it('trims surrounding whitespace', () => {
    assert.equal(validateId('  abc  '), 'abc');
  });

  it('throws TypeError for null', () => {
    assert.throws(() => validateId(null), TypeError);
  });

  it('throws TypeError for undefined', () => {
    assert.throws(() => validateId(undefined), TypeError);
  });

  it('throws TypeError for a number', () => {
    assert.throws(() => validateId(1), TypeError);
  });

  it('throws TypeError for an empty string', () => {
    assert.throws(() => validateId(''), TypeError);
  });

  it('throws TypeError for a whitespace-only string', () => {
    assert.throws(() => validateId('   '), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateSort
// ---------------------------------------------------------------------------
describe('validateSort', () => {
  it('returns "priority" for lowercase input', () => {
    assert.equal(validateSort('priority'), 'priority');
  });

  it('returns "date" for lowercase input', () => {
    assert.equal(validateSort('date'), 'date');
  });

  it('normalises uppercase input to lowercase', () => {
    assert.equal(validateSort('PRIORITY'), 'priority');
  });

  it('trims surrounding whitespace before validating', () => {
    assert.equal(validateSort('  date  '), 'date');
  });

  it('throws TypeError for an unrecognised sort field', () => {
    assert.throws(() => validateSort('name'), TypeError);
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validateSort(0), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateTitle boundary values and type mismatches
// ---------------------------------------------------------------------------
describe('validateTitle — edge cases', () => {
  it('accepts a title of exactly 1 character (minimum boundary)', () => {
    assert.equal(validateTitle('Z'), 'Z');
  });

  it('throws TypeError when title is a boolean', () => {
    assert.throws(() => validateTitle(false), TypeError);
  });

  it('throws TypeError when title is an array', () => {
    assert.throws(() => validateTitle(['hello']), TypeError);
  });

  it('throws TypeError when title is a plain object', () => {
    assert.throws(() => validateTitle({}), TypeError);
  });

  it('title consisting only of spaces trims to empty and throws', () => {
    assert.throws(() => validateTitle('\t  \n'), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateDescription boundary values and type mismatches
// ---------------------------------------------------------------------------
describe('validateDescription — edge cases', () => {
  it('whitespace-only string trims to empty string (returns "")', () => {
    assert.equal(validateDescription('   \t  '), '');
  });

  it('throws TypeError when value is a boolean', () => {
    assert.throws(() => validateDescription(true), TypeError);
  });

  it('throws TypeError when value is an array', () => {
    assert.throws(() => validateDescription([]), TypeError);
  });

  it('accepts an empty string (optional field present but blank)', () => {
    assert.equal(validateDescription(''), '');
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateStatus type mismatches and missing values
// ---------------------------------------------------------------------------
describe('validateStatus — edge cases', () => {
  it('throws TypeError for null', () => {
    assert.throws(() => validateStatus(null), TypeError);
  });

  it('throws TypeError for undefined', () => {
    assert.throws(() => validateStatus(undefined), TypeError);
  });

  it('throws TypeError for a boolean', () => {
    assert.throws(() => validateStatus(false), TypeError);
  });

  it('throws TypeError for an array', () => {
    assert.throws(() => validateStatus([]), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validatePriority type mismatches and normalisation
// ---------------------------------------------------------------------------
describe('validatePriority — edge cases', () => {
  it('throws TypeError for null', () => {
    assert.throws(() => validatePriority(null), TypeError);
  });

  it('throws TypeError for undefined', () => {
    assert.throws(() => validatePriority(undefined), TypeError);
  });

  it('normalises mixed-case "Medium" to "medium"', () => {
    assert.equal(validatePriority('Medium'), 'medium');
  });

  it('normalises mixed-case "Low" to "low"', () => {
    assert.equal(validatePriority('Low'), 'low');
  });

  it('throws TypeError for an empty string', () => {
    assert.throws(() => validatePriority(''), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateId type mismatches
// ---------------------------------------------------------------------------
describe('validateId — edge cases', () => {
  it('throws TypeError for a boolean', () => {
    assert.throws(() => validateId(true), TypeError);
  });

  it('throws TypeError for an array', () => {
    assert.throws(() => validateId([]), TypeError);
  });

  it('throws TypeError for an object', () => {
    assert.throws(() => validateId({}), TypeError);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateSort normalisation and missing values
// ---------------------------------------------------------------------------
describe('validateSort — edge cases', () => {
  it('normalises uppercase "PRIORITY" to "priority"', () => {
    assert.equal(validateSort('PRIORITY'), 'priority');
  });

  it('normalises uppercase "DATE" to "date"', () => {
    assert.equal(validateSort('DATE'), 'date');
  });

  it('trims surrounding whitespace before validating', () => {
    assert.equal(validateSort('  priority  '), 'priority');
  });

  it('throws TypeError for null', () => {
    assert.throws(() => validateSort(null), TypeError);
  });

  it('throws TypeError for undefined', () => {
    assert.throws(() => validateSort(undefined), TypeError);
  });
});

// ---------------------------------------------------------------------------
// validateCategory
// ---------------------------------------------------------------------------
describe('validateCategory', () => {
  it('returns trimmed category for a valid string', () => {
    assert.equal(validateCategory('  work  '), 'work');
  });

  it('returns "general" when value is undefined', () => {
    assert.equal(validateCategory(undefined), 'general');
  });

  it('returns "general" when value is null', () => {
    assert.equal(validateCategory(null), 'general');
  });

  it('returns "general" when value is a whitespace-only string', () => {
    assert.equal(validateCategory('   '), 'general');
  });

  it('accepts a category of exactly 50 characters', () => {
    const category = 'a'.repeat(50);
    assert.equal(validateCategory(category), category);
  });

  it('accepts categories with alphanumeric and dash/underscore', () => {
    assert.equal(validateCategory('work-2024'), 'work-2024');
    assert.equal(validateCategory('personal_todo'), 'personal_todo');
    assert.equal(validateCategory('urgent_work-2024'), 'urgent_work-2024');
  });

  it('throws TypeError when value is not a string', () => {
    assert.throws(() => validateCategory(42), TypeError);
    assert.throws(() => validateCategory(true), TypeError);
    assert.throws(() => validateCategory([]), TypeError);
  });

  it('throws TypeError for a category exceeding 50 characters', () => {
    assert.throws(() => validateCategory('a'.repeat(51)), TypeError);
  });

  it('throws TypeError for a category with invalid characters', () => {
    assert.throws(() => validateCategory('work@home'), TypeError);
    assert.throws(() => validateCategory('personal#1'), TypeError);
    assert.throws(() => validateCategory('urgent!'), TypeError);
    assert.throws(() => validateCategory('work.2024'), TypeError);
    assert.throws(() => validateCategory('task/home'), TypeError);
  });

  it('preserves case as supplied', () => {
    assert.equal(validateCategory('Work'), 'Work');
    assert.equal(validateCategory('PERSONAL'), 'PERSONAL');
    assert.equal(validateCategory('MiXeD_CaSe'), 'MiXeD_CaSe');
  });
});

// ---------------------------------------------------------------------------
// Edge cases — validateCategory type mismatches
// ---------------------------------------------------------------------------
describe('validateCategory — edge cases', () => {
  it('throws TypeError for boolean true', () => {
    assert.throws(() => validateCategory(true), TypeError);
  });

  it('throws TypeError for boolean false', () => {
    assert.throws(() => validateCategory(false), TypeError);
  });

  it('throws TypeError for an object', () => {
    assert.throws(() => validateCategory({}), TypeError);
  });
});
