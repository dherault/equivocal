import { describe, expect, test } from '@jest/globals'

import { adjustLineIndentation } from '~helpers/postProcessPrinterOutput'

describe('adjustLineIndentation', () => {

  test('Adjusts line indentation correctly', () => {
    expect(adjustLineIndentation('  const a = 1;', 2, 2, 2, 2)).toBe('  const a = 1;')
    expect(adjustLineIndentation('  const a = 1;', 2, 2, 2, 4)).toBe('    const a = 1;')
    expect(adjustLineIndentation('    const a = 1;', 2, 4, 4, 2)).toBe('  const a = 1;')
    expect(adjustLineIndentation('    const a = 1;', 2, 4, 4, 4)).toBe('    const a = 1;')
    expect(adjustLineIndentation('    const a = 1;', 2, 2, 4, 2)).toBe('  const a = 1;')
    expect(adjustLineIndentation('    const a = 1;', 2, 2, 2, 2)).toBe('    const a = 1;')
  })

})
