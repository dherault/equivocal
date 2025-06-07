import path from 'node:path'

import ts, { type IfStatement, type SyntaxList } from 'typescript'

import type { Executor, ResultItem } from '~types'

import { getChildrenOfKind } from '~helpers/getChildrenOfKind'
import { getLineNumber } from '~helpers/getLineNumber'

const CODE = 'invert-if'

export const executor: Executor<IfStatement> = {
  code: CODE,
  name: 'Invert Ifs',
  onKind: ts.SyntaxKind.IfStatement,
  execute,
}

function execute(ifStatement: ts.IfStatement): ResultItem[] | undefined {
  if (ifStatement.elseStatement) return
  if (!ifStatement.thenStatement) return

  const parentSyntaxListChildren = getChildrenOfKind<SyntaxList>(ifStatement.parent, ts.SyntaxKind.SyntaxList)[0]?.getChildren()

  if (!parentSyntaxListChildren?.length) return

  const ifStart = ifStatement.getStart()
  const ifEnd = ifStatement.getEnd()
  const parentChildrenPosition = parentSyntaxListChildren.findIndex(x => x.getStart() === ifStart && x.getEnd() === ifEnd)
  const isLastChild = parentChildrenPosition === parentSyntaxListChildren.length - 1

  if (isLastChild) return createItems(ifStatement)

  const nextSibling = parentSyntaxListChildren[parentChildrenPosition + 1]

  if (!nextSibling) return
  if (nextSibling.kind !== ts.SyntaxKind.ReturnStatement) return

  return createItems(ifStatement)
}

function createItems(ifStatement: IfStatement): ResultItem[] | undefined {
  const keywordToken = ifStatement.getFirstToken()

  if (!keywordToken) return

  const sourceFile = ifStatement.getSourceFile()

  return [
    {
      code: CODE,
      filePath: sourceFile.fileName,
      relativeFilePath: path.basename(sourceFile.fileName),
      line: getLineNumber(ifStatement),
      start: keywordToken.getStart(),
      end: keywordToken.getEnd(),
      message: 'Invert if statement to reduce nesting.',
      // fix: createFix(ifStatement),
    },
  ]
}

// function createFix(ifStatement: IfStatement): ResultItemFix | undefined {
//   const parent = ifStatement.getParent()

//   if (!parent) return

//   const start = parent.getStart()
//   const end = parent.getEnd()

//   const binaryExpression = ifStatement.getChildrenOfKind(SyntaxKind.BinaryExpression)[0]
//   const thenSyntaxList = ifStatement.getThenStatement()?.getChildrenOfKind(SyntaxKind.SyntaxList)[0]

//   if (!(binaryExpression && thenSyntaxList)) return

//   invertBinaryExpression(binaryExpression)

//   ifStatement.setExpression(binaryExpression.getText())

//   return {
//     start,
//     end,
//     content: ifStatement.getText(),
//   }
// }

// function invertBinaryExpression(binaryExpression: BinaryExpression) {
//   switch (binaryExpression.getOperatorToken().getKind()) {
//     // ==
//     case SyntaxKind.EqualsEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} != ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // ===
//     case SyntaxKind.EqualsEqualsEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} !== ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // !=
//     case SyntaxKind.ExclamationEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} == ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // !==
//     case SyntaxKind.ExclamationEqualsEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} === ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // >
//     case SyntaxKind.GreaterThanToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} <= ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // >=
//     case SyntaxKind.GreaterThanEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} < ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // <
//     case SyntaxKind.LessThanToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} >= ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // <=
//     case SyntaxKind.LessThanEqualsToken: {
//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} > ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // &&
//     case SyntaxKind.AmpersandAmpersandToken: {
//       // Apply De Morgan's law
//       negateExpression(binaryExpression.getLeft())
//       negateExpression(binaryExpression.getRight())

//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} || ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // ||
//     case SyntaxKind.BarBarToken: {
//       // Apply De Morgan's law
//       negateExpression(binaryExpression.getLeft())
//       negateExpression(binaryExpression.getRight())

//       binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} && ${binaryExpression.getRight().getText()}`)
//       break
//     }
//     // ??
//     case SyntaxKind.QuestionQuestionToken: {
//       binaryExpression.replaceWithText(`!(${binaryExpression.getLeft().getText()} ?? ${binaryExpression.getRight().getText()})`)
//       break
//     }
//     default: {
//       throw new Error(`Unsupported binary operator: ${binaryExpression.getOperatorToken().getKindName()}`)
//     }
//   }
// }

// function negateExpression(expression: Expression) {
//   if (Node.isPrefixUnaryExpression(expression)) {
//     if (expression.getOperatorToken() === SyntaxKind.ExclamationToken) {
//       expression.replaceWithText(expression.getOperand().getText())

//       return
//     }
//   }

//   if (Node.isBinaryExpression(expression)) {
//     invertBinaryExpression(expression)

//     return
//   }

//   // TODO remove parenthesis
//   expression.replaceWithText(`!(${expression.getText()})`)
// }
