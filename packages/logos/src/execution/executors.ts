import type { Executor } from '../types'

import { executor as invertIfExecutor } from './invert-if'

export const executors: Executor[] = [
  invertIfExecutor,
]

export const nodeTypeToExecutor: Partial<Record<Executor['on'], Executor[]>> = {}

executors.forEach(executor => {
  if (!nodeTypeToExecutor[executor.on]) nodeTypeToExecutor[executor.on] = []

  nodeTypeToExecutor[executor.on]!.push(executor)
})
