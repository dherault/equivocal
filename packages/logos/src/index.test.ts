import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { addSourceFileToProject, createProject, execute } from './index'

const tsConfigPath = path.join(__dirname, './test-tsconfigs/tsconfig-simple-no-files.json')

describe('Project creation', () => {
  test('Can create a project', () => {
    const project = createProject(tsConfigPath)

    expect(project).toBeDefined()
  })

  test('Can create a project with adding tsconfig file paths', () => {
    const project = createProject(tsConfigPath, false)

    expect(project).toBeDefined()
  })

  test('Can create a project with skipping tsconfig file paths', () => {
    const project = createProject(tsConfigPath, true)

    expect(project).toBeDefined()
  })
})

describe('Adding files to the project', () => {
  test('Can add a source file to the project', () => {
    const project = createProject(tsConfigPath)
    const filePath = 'index.ts'
    const fileContent = 'const test = "Hello, World!";'

    addSourceFileToProject(project, filePath, fileContent)

    const sourceFile = project.getSourceFile(filePath)

    expect(sourceFile).toBeDefined()
    expect(sourceFile?.getText()).toBe(fileContent)
  })
})

describe('Inverting ifs', () => {

  function createProjectWithFile(fileContent: string) {
    const project = createProject(tsConfigPath)

    addSourceFileToProject(project, 'index.ts', fileContent)

    return project
  }

  test('Suggests inverting simple ifs', () => {
    const project = createProjectWithFile(`
      function main() {
        const a = Math.random();

        if (a > 0.5) {
          console.log('Yes');
        }
      }
    `)

    const results = execute(project)

    expect(results).toHaveLength(1)
    expect(results[0].code).toBe('invert-if')
  })
})
