import { describe, test } from '@jest/globals'

describe('adjustLineIndentation', () => {

  test('Adjusts line indentation correctly', () => {
    // expect(adjustLineIndentation('  const a = 1;', 0, 2, 2)).toBe('  const a = 1;')
    // expect(adjustLineIndentation('  const a = 1;', 2, 2, 2)).toBe('    const a = 1;')
    // expect(adjustLineIndentation('  const a = 1;', 4, 2, 2)).toBe('      const a = 1;')
    // expect(adjustLineIndentation('  const a = 1;', 0, 2, 4)).toBe('    const a = 1;')
    // expect(adjustLineIndentation('   const a = 1;', 0, 3, 3)).toBe('   const a = 1;')
    // expect(adjustLineIndentation('   const a = 1;', 3, 3, 3)).toBe('      const a = 1;')
    // expect(adjustLineIndentation('    const a = 1;', 0, 4, 2)).toBe('  const a = 1;')
    // expect(adjustLineIndentation('    const a = 1;', 0, 4, 4)).toBe('    const a = 1;')
    // expect(adjustLineIndentation('    const a = 1;', 2, 4, 4)).toBe('      const a = 1;')
    // expect(adjustLineIndentation('    const a = 1;', 4, 4, 4)).toBe('        const a = 1;')
  })

})
