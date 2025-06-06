import type { SyntaxKind } from 'ts-morph'

export type { Project, FunctionTypeNode } from 'ts-morph'

export type Executor = {
  code: string
  name: string
  on: SyntaxKind
  execute: (node: any) => ResultItem[]
}

export type ResultItem = {
  code: string
  filePath: string
  start: number
  end: number
  message: string
  fix?: {
    start: number
    end: number
    content: string
  }
}
