import { type IfStatement, SyntaxKind } from 'ts-morph'

import type { Executor, ResultItem } from '../../types'

const CODE = 'invert-if'
const MESSAGE = 'Invert if statement to reduce nesting.'

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
  return [
    {
      code: CODE,
      start: 0,
      end: 1,
      filePath: node.getSourceFile().getFilePath(),
      message: MESSAGE,
    },
  ]
}
