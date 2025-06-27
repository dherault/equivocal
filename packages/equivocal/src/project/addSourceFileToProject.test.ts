import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { createProject } from '~project/createProject'
import { addSourceFileToProject } from '~project/addSourceFileToProject'

const NoFilesTsConfigPath = path.join(__dirname, '../test-projects/no-files/tsconfig.json')

describe('addSourceFileToProject', () => {

  test('Can add a source file to the project', () => {
    const project = createProject(NoFilesTsConfigPath)
    const filePath = 'index.ts'
    const fileContent = 'const test = "Hello, World!";'

    addSourceFileToProject(project, filePath, fileContent)

    expect(project.sourceFiles).toHaveLength(1)
    expect(project.sourceFiles[0].getText()).toBe(fileContent)
  })

})
