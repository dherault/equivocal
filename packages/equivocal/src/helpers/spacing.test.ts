import { describe, expect, test } from '@jest/globals'

import { type Spacing, applySpacing, extractSpacing } from '~helpers/spacing'

describe('extractSpacing', () => {

  test('Extracts spacing from code correctly 1', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) {
          return;
        }

        if (a > b) {
          console.log('Yes');
        }
      }
    `
    const expected: Spacing[] = [
      {
        code: `      function main() {
        const a = Math.random();
        const b = Math.random();`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a <= b) {
          return;
        }`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a > b) {
          console.log('Yes');
        }
      }`,
        emptyLinesAfter: 1,
      },
    ]

    expect(extractSpacing(code)).toEqual(expected)
  })

  test('Extracts spacing from code correctly 2', () => {
    const code = `
      {
        const a = Math.random();

        // b is seprated from a by one empty line and a comment
        const b = Math.random();

        if (a < b) {
          console.log('Maybe');
        }

        if (a > b) {
          console.log('Yes');
        }
      }
    `
    const expected: Spacing[] = [
      {
        code: `      {
        const a = Math.random();`,
        emptyLinesAfter: 1,
      },
      {
        code: `        // b is seprated from a by one empty line and a comment
        const b = Math.random();`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a < b) {
          console.log('Maybe');
        }`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a > b) {
          console.log('Yes');
        }
      }`,
        emptyLinesAfter: 1,
      },
    ]

    expect(extractSpacing(code)).toEqual(expected)
  })

  test('Applies spacing to code correctly', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();
        if (a <= b) {
          return;
        }
        if (a > b) {
          console.log('Yes');
        }
      }
    `
    const spacings: Spacing[] = [
      {
        code: `      function main() {
        const a = Math.random();
        const b = Math.random();`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a <= b) {
          return;
        }`,
        emptyLinesAfter: 1,
      },
      {
        code: `        if (a > b) {
          console.log('Yes');
        }
      }`,
        emptyLinesAfter: 1,
      },
    ]

    const expected = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) {
          return;
        }

        if (a > b) {
          console.log('Yes');
        }
      }
`

    expect(applySpacing(code, spacings)).toEqual(expected)
  })

  test('Extracts and applies spacing on modified code', () => {
    const code = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a > b) {
          // This is a comment

          // This is another comment
          console.log('Yes');
        }
      }
    `

    const spacings = extractSpacing(code)

    const modifiedCode = `
      function main() {
        const a = Math.random();
        const b = Math.random();
        if (a <= b) return;
        // This is a comment
        // This is another comment
        console.log('Yes');
      }
    `

    const expected = `
      function main() {
        const a = Math.random();
        const b = Math.random();

        if (a <= b) return;

        // This is a comment

        // This is another comment
        console.log('Yes');
      }
    `

    expect(applySpacing(modifiedCode, spacings)).toEqual(expected)
  })

})
