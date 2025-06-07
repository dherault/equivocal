import type { SyntaxKind } from 'ts-morph'

export type Executor = {
  code: string
  name: string
  on: SyntaxKind
  execute: (node: any) => ResultItem[] | undefined
}

export type ResultItem = {
  code: string
  filePath: string
  relativeFilePath: string
  line: number
  start: number
  end: number
  message: string
  fix?: ResultItemFix
}

export type ResultItemFix = {
  start: number
  end: number
  content: string
}
