import { type IfStatement, SyntaxKind } from 'ts-morph'

import type { Executor, ResultItem, ResultItemFix } from '../../types'

const CODE = 'invert-if'

export const executor: Executor = {
  code: CODE,
  name: 'Invert Ifs',
  on: SyntaxKind.IfStatement,
  execute,
}

function execute(node: IfStatement): ResultItem[] | undefined {
  if (node.getElseStatement()) return
  if (!node.getThenStatement()) return

  const parentSyntaxListChildren = node.getParent()?.getChildrenOfKind(SyntaxKind.SyntaxList)[0]?.getChildren()

  if (!parentSyntaxListChildren.length) return

  const parentChildrenPosition = parentSyntaxListChildren.findIndex(x => x.getStart() === node.getStart() && x.getEnd() === node.getEnd())
  const isLastChild = parentChildrenPosition === parentSyntaxListChildren.length - 1

  if (isLastChild) return createItems(node)

  const nextSibling = parentSyntaxListChildren[parentChildrenPosition + 1]

  if (!nextSibling) return
  if (nextSibling.getKind() !== SyntaxKind.ReturnStatement) return

  return createItems(node)
}

function createItems(node: IfStatement): ResultItem[] {
  const sourceFile = node.getSourceFile()
  const ifKeyword = node.getChildrenOfKind(SyntaxKind.IfKeyword)[0]

  return [
    {
      code: CODE,
      filePath: sourceFile.getFilePath(),
      relativeFilePath: sourceFile.getBaseName(),
      line: ifKeyword.getStartLineNumber(),
      start: ifKeyword.getStart(),
      end: ifKeyword.getEnd(),
      message: 'Invert if statement to reduce nesting.',
      fix: createFix(node),
    },
  ]
}

function createFix(node: IfStatement): ResultItemFix {
  return {
    start: node.getStart(),
    end: node.getEnd(),
    content: 'foo',
  }
}
