import ts from 'typescript'

import type { Project, ResultItem } from '~types'

import { nodeKindToExecutor } from './executors'

export function execute(project: Project) {
  const items: ResultItem[] = []

  project.sourceFiles.forEach(sourceFile => {
    traverse(sourceFile, node => {
      items.push(
        ...nodeKindToExecutor[node.kind]
          ?.flatMap(executor => executor.execute(project, node))
          .filter(item => !!item)
        ?? []
      )
    })
  })

  return items
}

function traverse(node: ts.Node, callback: (node: ts.Node) => void) {
  callback(node)

  ts.forEachChild(node, node => traverse(node, callback))
}
