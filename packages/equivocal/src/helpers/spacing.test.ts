import { describe, expect, test } from '@jest/globals'

import { type Spacing, applySpacing, extractSpacing } from '~helpers/spacing'

describe('extractSpacing', () => {

  test('Extracts spacing from code correctly', () => {
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

})
