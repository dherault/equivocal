import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { execute } from '~execution/execute'
import { applyFix } from '~execution/applyFix'

import { createProject } from '~project/createProject'
import { addSourceFileToProject } from '~project/addSourceFileToProject'

const NoFilesTsConfigPath = path.join(__dirname, '../../test-projects/no-files/tsconfig.json')

function createProjectWithFile(fileContent: string) {
  const project = createProject(NoFilesTsConfigPath)

  addSourceFileToProject(project, 'index.ts', fileContent)

  return project
}

function expectInvertIf(code: string, fixedCode?: string, appliedFixedCode?: string) {
  const project = createProjectWithFile(code)
  const results = execute(project)

  expect(results).toHaveLength(1)
  expect(results[0].code).toBe('invert-if')
  expect(results[0].message).toBe('Invert if statement to reduce nesting.')
  expect(results[0].filePath).toMatch(/index.ts$/)
  expect(results[0].relativeFilePath).toBe('index.ts')

  if (!fixedCode) return

  expect(results[0].fix).toBeDefined()
  expect(results[0].fix?.content).toBe(fixedCode)

  if (!appliedFixedCode) return

  expect(applyFix(project, results[0])).toBe(appliedFixedCode)
}

function expectNoInvertIf(code: string) {
  const project = createProjectWithFile(code)
  const results = execute(project)

  expect(results).toHaveLength(0)
}

describe('Inverting ifs', () => {

  /* ---
    RETURN
  --- */

  test('Suggests inverting a simple if with return', () => {
    expectInvertIf(
      `
        function main() {
          const a = Math.random()

          // b is seprated from a by one empty line and a comment
          const b = Math.random()

          if (a < b) {
            console.log('Maybe')
          }

          if (a > b) {
            console.log('Yes')
          }
        }
      `,
      `{
          const a = Math.random()

          // b is seprated from a by one empty line and a comment
          const b = Math.random()

          if (a < b) {
            console.log('Maybe')
          }

          if (a <= b) return
          console.log('Yes')
        }`,
      `
        function main() {
          const a = Math.random()

          // b is seprated from a by one empty line and a comment
          const b = Math.random()

          if (a < b) {
            console.log('Maybe')
          }

          if (a <= b) return
          console.log('Yes')
        }
      `
    )
  })

  test('Suggests inverting nested ifs with return 1', () => {
    const project = createProjectWithFile(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          const b = Math.random()

          if (b > 0.5) {
            console.log('Yes')
          }
        }
      }
    `)

    const results = execute(project)

    expect(results).toHaveLength(2)
    expect(results[0].code).toBe('invert-if')
    expect(results[1].code).toBe('invert-if')

    expect(applyFix(project, results[0])).toBe(`
      function main() {
        const a = Math.random()

        if (a <= 0.5) return
        const b = Math.random()
        if (b > 0.5) {
          console.log('Yes')
        }
      }
    `)

    expect(applyFix(project, results[1])).toBe(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          const b = Math.random()

          if (b <= 0.5) return
          console.log('Yes')
        }
      }
    `)
  })

  test('Suggests inverting nested ifs with return 2', () => {
    expectInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          const b = Math.random()

          if (b > 0.5) {
            console.log('Yes')
          }

          console.log('No')
        }
      }
    `,
    `{
        const a = Math.random()

        if (a <= 0.5) return
        const b = Math.random()

        if (b > 0.5) {
          console.log('Yes')
        }

        console.log('No')
      }`,
    `
      function main() {
        const a = Math.random()

        if (a <= 0.5) return
        const b = Math.random()

        if (b > 0.5) {
          console.log('Yes')
        }

        console.log('No')
      }
    `
    )
  })

  test('Suggests inverting if with following value return', () => {
    expectInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          console.log('Yes')

          return true
        }

        return false
      }
    `,
    `{
        const a = Math.random()

        if (a <= 0.5) return false
        console.log('Yes')

        return true
      }`,
    `
      function main() {
        const a = Math.random()

        if (a <= 0.5) return false
        console.log('Yes')

        return true
      }
    `
    )
  })

  test('Suggests inverting if with following value return', () => {
    expectInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          console.log('Yes')
          console.log('Yes')

          return true
        }

        return false
      }
    `,
    `{
        const a = Math.random()

        if (a <= 0.5) return false
        console.log('Yes')
        console.log('Yes')

        return true
      }`,
    `
      function main() {
        const a = Math.random()

        if (a <= 0.5) return false
        console.log('Yes')
        console.log('Yes')

        return true
      }
    `
    )
  })

  /* ---
    RETURN NO INVERSION
  --- */

  test('Does not suggest inverting if with else statement', () => {
    expectNoInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          console.log('Yes')
        }
        else {
          console.log('No')
        }
      }
    `)
  })

  test('Does not suggest inverting if with equal amount of following statements', () => {
    expectNoInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          console.log('Yes')
        }

        console.log('No')
      }
    `)
  })

  test('Does not suggest inverting if with many following statements', () => {
    expectNoInvertIf(`
      function main() {
        const a = Math.random()

        if (a > 0.5) {
          console.log('Yes')

          return true
        }

        console.log('No')

        return false
      }
    `)
  })

  /* ---
    CONTINUE
  --- */

  test('Suggests inverting a simple if with continue', () => {
    expectInvertIf(
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a < 6) {
              console.log('Yes')
            }
          }
        }
      `,
      `{
            a++

            if (a >= 6) continue
            console.log('Yes')
          }`,
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a >= 6) continue
            console.log('Yes')
          }
        }
      `
    )
  })

  /* ---
    BREAK
  --- */

  test('Suggests inverting a simple if with break', () => {
    expectInvertIf(
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a < 6) {
              console.log('Yes')
              console.log('Yes')
            }

            break
          }
        }
      `,
      `{
            a++

            if (a >= 6) break
            console.log('Yes')
            console.log('Yes')
          }`,
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a >= 6) break
            console.log('Yes')
            console.log('Yes')
          }
        }
      `
    )
  })

  /* ---
    THROW
  --- */

  test('Suggests inverting a simple if with throw', () => {
    expectInvertIf(
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a < 6) {
              console.log('Yes')
              console.log('Yes')
            }

            throw new Error('Error')
          }
        }
      `,
      `{
            a++

            if (a >= 6) throw new Error('Error')
            console.log('Yes')
            console.log('Yes')
          }`,
      `
        function main() {
          const a = 0

          while (a < 12) {
            a++

            if (a >= 6) throw new Error('Error')
            console.log('Yes')
            console.log('Yes')
          }
        }
      `
    )
  })

})
