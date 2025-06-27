import path from 'node:path'

import ts from 'typescript'

import type { Project } from '~types'

export function addSourceFileToProject(project: Project, filePath: string, fileContent: string) {
  project.sourceFiles.push(ts.createSourceFile(
    path.basename(filePath),
    fileContent,
    ts.ScriptTarget.Latest,
    true
  ))
}
