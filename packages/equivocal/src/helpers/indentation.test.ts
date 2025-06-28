import ts from 'typescript'
import { describe, expect, test } from '@jest/globals'

import { appendIndentation, detectLineIndentation, detectSyntaxListIndentation, detectTextTabSize, replaceIndentation } from '~helpers/indentation'
import { getFirstChildOfKind } from '~helpers/getFirstChildOfKind'

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
    const b = 2;
    if (a > b) {
      return true;
    }
`)).toBe(2)
    expect(detectTextTabSize(`
    const a = 1;

    if (a > 0) {
      return;
    }
`)).toBe(2)
  })

})

describe('detectBlockIndentation', () => {
  test('Detects indentation of block 1', () => {
    const source = `
      function main() {
        const a = 1;
        const b = 2;
      }
    `
    const sourceFile = ts.createSourceFile('test.ts', source, ts.ScriptTarget.ESNext, true)
    const block = (sourceFile.statements[0] as ts.FunctionDeclaration).body!
    const syntaxList = getFirstChildOfKind<ts.SyntaxList>(block, ts.SyntaxKind.SyntaxList)!

    expect(detectSyntaxListIndentation(syntaxList)).toBe(8)
  })

  test('Detects indentation of block 2', () => {
    const source = `
function main() {
  const a = 1;
  const b = 2;
}
    `
    const sourceFile = ts.createSourceFile('test.ts', source, ts.ScriptTarget.ESNext, true)
    const block = (sourceFile.statements[0] as ts.FunctionDeclaration).body!
    const syntaxList = getFirstChildOfKind<ts.SyntaxList>(block, ts.SyntaxKind.SyntaxList)!

    expect(detectSyntaxListIndentation(syntaxList)).toBe(2)
  })
})

describe('appendIndentation', () => {

  test('should append indentation correctly', () => {
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

    const formattedCode = `
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

    expect(appendIndentation(code, 4)).toBe(formattedCode)
  })

  test('should append indentation correctly with skipping the first line', () => {
    const code = `{
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

    const formattedCode = `{
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

    expect(appendIndentation(code, 4, true)).toBe(formattedCode)
  })

})

describe('replaceIndentation', () => {

  test('should replace indentation correctly', () => {
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

    const formattedCode = `
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

    expect(replaceIndentation(code, 4, 2)).toBe(formattedCode)
  })

})
