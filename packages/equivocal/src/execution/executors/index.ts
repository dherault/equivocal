import type { Executor } from '~types'

import { executor as invertIfExecutor } from '~execution/executors/invert-if'

export const executors: Executor[] = [
  invertIfExecutor as unknown as Executor,
]

export const nodeKindToExecutor: Partial<Record<Executor['onKind'], Executor[]>> = {}

executors.forEach(executor => {
  if (!nodeKindToExecutor[executor.onKind]) nodeKindToExecutor[executor.onKind] = []

  nodeKindToExecutor[executor.onKind]!.push(executor)
})
