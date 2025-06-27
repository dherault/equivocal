import { describe, expect, test } from '@jest/globals'

import { formatIfStatements } from '~helpers/formatIfStatements'

describe('formatIfStatements', () => {
  test('should format if statements correctly 1', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b)
          return;
        if (a > b)
          console.log('Yes');
      }
    `

    const formattedCode = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) return;
        if (a > b) console.log('Yes');
      }
    `

    expect(formatIfStatements(code)).toBe(formattedCode)
  })

  test('should format if statements correctly 2', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if ((a + 1) <= (b - 1))
          return;
      }
    `

    const formattedCode = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if ((a + 1) <= (b - 1)) return;
      }
    `

    expect(formatIfStatements(code)).toBe(formattedCode)
  })

  test('does not format if statements that are already formatted', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) return;
        if (a > b) console.log('Yes');
      }
    `

    const formattedCode = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) return;
        if (a > b) console.log('Yes');
      }
    `

    expect(formatIfStatements(code)).toBe(formattedCode)
  })
})
