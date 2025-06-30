import { describe, expect, test } from '@jest/globals'

import { insertEmptyLine } from '~helpers/insertEmptyLine'

describe('insertEmptyLine', () => {

  test('should insert lines correctly', () => {
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
    const after = `if (a <= b)
          return;`

    const formattedCode = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b)
          return;

        if (a > b)
          console.log('Yes');
      }
    `

    expect(insertEmptyLine(code, after)).toBe(formattedCode)
  })

  test('does not insert lines if not found', () => {
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
    const after = 'foo'

    expect(insertEmptyLine(code, after)).toBe(code)
  })

})
