import { getTsconfig } from 'get-tsconfig'
import { Project, SyntaxKind } from 'ts-morph'

import type { Executor, FunctionTypeNode, ResultItem } from './types'

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
    on: SyntaxKind.FunctionDeclaration,
    execute: (node: FunctionTypeNode) => {
      const items: ResultItem[] = [
        {
          code: 'invert-if',
          start: 0,
          end: 1,
          filePath: node.getSourceFile().getFilePath(),
          message: 'Invert if statement',
        },
      ]

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
    sourceFile.forEachChild(node => {
      const executors = nodeTypeToExecutor[node.getKind()]

      if (!executors?.length) return

      items.push(...executors.flatMap(executor => executor.execute(node)))
    })
  })

  return items
}
