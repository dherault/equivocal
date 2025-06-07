import { describe, expect, test } from '@jest/globals'

import { detectLineIndentation, detectTextTabSize } from '~helpers/detectIndentation'

describe('detectLineIndentation', () => {

  test('Detects spaces indentation', () => {
    expect(detectLineIndentation('const a = 1;')).toBe(0)
    expect(detectLineIndentation(' const a = 1;')).toBe(1)
    expect(detectLineIndentation('  const a = 1;')).toBe(2)
    expect(detectLineIndentation('   const a = 1;')).toBe(3)
    expect(detectLineIndentation('    const a = 1;')).toBe(4)
    expect(detectLineIndentation('\tconst a = 1;')).toBe(1)
    expect(detectLineIndentation('\t\tconst a = 1;')).toBe(2)
    expect(detectLineIndentation('\t\t\tconst a = 1;')).toBe(3)
    expect(detectLineIndentation('\t\t\t\tconst a = 1;')).toBe(4)
  })

})

describe('detectTextTabSize', () => {

  test('Detects tab size from text', () => {
    expect(detectTextTabSize('')).toBe(0)
    expect(detectTextTabSize('const a = 1;')).toBe(0)
    expect(detectTextTabSize('  const a = 1;')).toBe(2)
    expect(detectTextTabSize(`
  const a = 1;
  const b = 2;
`)).toBe(2)
    expect(detectTextTabSize(`
   const a = 1;
   const b = 2;
`)).toBe(3)
    expect(detectTextTabSize(`
    const a = 1;
    const b = 2;
`)).toBe(4)
    expect(detectTextTabSize(`
    const a = 1;

    if (a > 0) {
      return;
    }
`)).toBe(2)
  })

})
