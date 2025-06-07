import { type IfStatement, SyntaxKind } from 'ts-morph'

import type { Executor, ResultItem } from '../../types'

const CODE = 'invert-if'

export const executor: Executor = {
  code: CODE,
  name: 'Invert Ifs',
  on: SyntaxKind.IfStatement,
  execute: (node: IfStatement) => {
    const items: ResultItem[] = []

    if (node.getElseStatement()) return items
    if (!node.getThenStatement()) return items

    const parentSyntaxListChildren = node.getParent()?.getChildrenOfKind(SyntaxKind.SyntaxList)[0]?.getChildren()

    if (!parentSyntaxListChildren.length) return items

    const parentChildrenPosition = parentSyntaxListChildren.findIndex(x => x.getStart() === node.getStart() && x.getEnd() === node.getEnd())
    const parentChildrenCount = parentSyntaxListChildren.length

    if (parentChildrenPosition === parentChildrenCount - 1) {
      items.push({
        code: CODE,
        start: 0,
        end: 1,
        filePath: node.getSourceFile().getFilePath(),
        message: 'Invert if statement',
      })
    }

    return items
  },
}
