import type ts from 'typescript'

export type Project = {
  sourceFiles: ts.SourceFile[]
  printer: ts.Printer
}

export type Executor<T extends ts.Node = ts.Node> = {
  code: string
  name: string
  onKind: T['kind']
  execute: (project: Project, node: T) => ResultItem[] | undefined
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
