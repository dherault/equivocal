import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { addSourceFileToProject, createProject } from './index'

const NoFilesTsConfigPath = path.join(__dirname, '../test-projects/no-files/tsconfig.json')
const OneFileTsConfigPath = path.join(__dirname, '../test-projects/one-file/tsconfig.json')

describe('Project creation', () => {

  test('Can create a project', () => {
    const project = createProject(NoFilesTsConfigPath)

    expect(project).toBeDefined()
  })

  test('Can create a project with adding tsconfig file paths', () => {
    const project = createProject(NoFilesTsConfigPath, false)

    expect(project).toBeDefined()
  })

  test('Can create a project with skipping tsconfig file paths', () => {
    const project = createProject(NoFilesTsConfigPath, true)

    expect(project).toBeDefined()
  })

  test('Can create a project with adding files from tsconfig', () => {
    const project = createProject(OneFileTsConfigPath)

    expect(project).toBeDefined()

    const sourceFile = project.getSourceFile('index.ts')

    expect(sourceFile).toBeDefined()
    expect(sourceFile?.getText()).toBeDefined()
  })

})

describe('Adding files to the project', () => {

  test('Can add a source file to the project', () => {
    const project = createProject(NoFilesTsConfigPath)
    const filePath = 'index.ts'
    const fileContent = 'const test = "Hello, World!";'

    addSourceFileToProject(project, filePath, fileContent)

    const sourceFile = project.getSourceFile(filePath)

    expect(sourceFile).toBeDefined()
    expect(sourceFile?.getText()).toBe(fileContent)
  })

})
