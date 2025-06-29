import { describe, expect, test } from '@jest/globals'

import type { Spacing } from '~types'

import { applySpacing, extractSpacing } from '~helpers/spacing'

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
    const expected: Spacing = {
      'function main() {\nconst a = Math.random();\nconst b = Math.random();': {
        before: 1,
        after: 1,
      },
      'if (a <= b) {\nreturn;\n}': {
        before: 1,
        after: 1,
      },
      'if (a > b) {\nconsole.log(\'Yes\');\n}\n}': {
        before: 1,
        after: 1,
      },
    }

    expect(extractSpacing(code)).toEqual(expected)
  })

  test('Extracts spacing from code correctly 2', () => {
    const code = `
      {
        const a = Math.random();

        // b is seprated from a by two empty lines and a comment
        const b = Math.random();

        if (a < b) {
          console.log('Maybe');
        }

        if (a > b) {
          console.log('Yes');
        }
      }
    `
    const expected: Spacing = {
      '{\nconst a = Math.random();': {
        before: 1,
        after: 1,
      },
      '// b is seprated from a by two empty lines and a comment\nconst b = Math.random();': {
        before: 1,
        after: 1,
      },
      'if (a < b) {\nconsole.log(\'Maybe\');\n}': {
        before: 1,
        after: 1,
      },
      'if (a > b) {\nconsole.log(\'Yes\');\n}\n}': {
        before: 1,
        after: 1,
      },
    }

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
    const spacing: Spacing = {
      'function main() {\nconst a = Math.random();\nconst b = Math.random();': {
        before: 1,
        after: 1,
      },
      'if (a <= b) {\nreturn;\n}': {
        before: 1,
        after: 1,
      },
      'if (a > b) {\nconsole.log(\'Yes\');\n}\n}': {
        before: 1,
        after: 1,
      },
    }

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

    expect(applySpacing(code, spacing)).toEqual(expected)
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
