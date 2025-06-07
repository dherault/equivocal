import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { createProject } from '~project/createProject'

const NoFilesTsConfigPath = path.join(__dirname, '../test-projects/no-files/tsconfig.json')
const OneFileTsConfigPath = path.join(__dirname, '../test-projects/one-file/tsconfig.json')

describe('createProject', () => {

  test('Can create a project', () => {
    const project = createProject(NoFilesTsConfigPath)

    expect(project).toBeDefined()
  })

  test('Can create a project', () => {
    const project = createProject(NoFilesTsConfigPath)

    expect(project).toBeDefined()
    expect(project.sourceFiles).toHaveLength(0)
  })

  test('Can create a project with adding files from tsconfig', () => {
    const project = createProject(OneFileTsConfigPath)

    expect(project).toBeDefined()
    expect(project.sourceFiles).toHaveLength(1)
  })

})
