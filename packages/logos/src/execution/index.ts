import { type Project } from 'ts-morph'

import type { ResultItem } from '../types'

import { nodeTypeToExecutor } from './executors'

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
