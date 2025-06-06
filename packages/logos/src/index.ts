import { getTsconfig } from 'get-tsconfig'
import { type IfStatement, Project, SyntaxKind } from 'ts-morph'

import type { Executor, ResultItem } from './types'

export function createProject(tsConfigPath?: string, skipAddingFilesFromTsConfig = false) {
  const finalTsConfigPath = tsConfigPath || getTsconfig()?.path

  if (!finalTsConfigPath) {
    throw new Error('Logos: No tsconfig file found')
  }

  const project = new Project({
    tsConfigFilePath: finalTsConfigPath,
    skipAddingFilesFromTsConfig,
  })

  return project
}

export function addSourceFileToProject(project: Project, filePath: string, fileContent: string) {
  project.createSourceFile(filePath, fileContent)
}

const executors: Executor[] = [
  {
    code: 'invert-if',
    name: 'Invert Ifs',
    on: SyntaxKind.IfStatement,
    execute: (node: IfStatement) => {
      const items: ResultItem[] = []

      if (node.getElseStatement()) return items
      if (!node.getThenStatement()) return items

      const parentChildren = node.getParent().getChildrenOfKind(SyntaxKind.SyntaxList)
      const parentSyntaxList = parentChildren[0]

      if (!parentSyntaxList) return items

      const parentSyntaxListChildren = parentSyntaxList.getChildren()
      const parentChildrenPosition = parentSyntaxListChildren.findIndex(x => x.getStart() === node.getStart() && x.getEnd() === node.getEnd())
      const parentChildrenCount = parentSyntaxListChildren.length

      if (parentChildrenPosition === parentChildrenCount - 1) {
        items.push({
          code: 'invert-if',
          start: 0,
          end: 1,
          filePath: node.getSourceFile().getFilePath(),
          message: 'Invert if statement',
        })
      }

      return items
    },
  },
]

const nodeTypeToExecutor: Partial<Record<Executor['on'], Executor[]>> = {}

executors.forEach(executor => {
  if (!nodeTypeToExecutor[executor.on]) nodeTypeToExecutor[executor.on] = []

  nodeTypeToExecutor[executor.on]!.push(executor)
})

export function execute(project: Project) {
  const items: ResultItem[] = []

  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.forEachDescendant(node => {
      const executors = nodeTypeToExecutor[node.getKind()]

      if (!executors?.length) return

      items.push(...executors.flatMap(executor => executor.execute(node)))
    })
  })

  return items
}
