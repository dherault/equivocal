import { type BinaryExpression, type Expression, type IfStatement, Node, SyntaxKind } from 'ts-morph'

import type { Executor, ResultItem, ResultItemFix } from '../../types'

const CODE = 'invert-if'

export const executor: Executor = {
  code: CODE,
  name: 'Invert Ifs',
  on: SyntaxKind.IfStatement,
  execute,
}

function execute(ifStatement: IfStatement): ResultItem[] | undefined {
  if (ifStatement.getElseStatement()) return
  if (!ifStatement.getThenStatement()) return

  const parentSyntaxListChildren = ifStatement.getParent()?.getChildrenOfKind(SyntaxKind.SyntaxList)[0]?.getChildren()

  if (!parentSyntaxListChildren.length) return

  const parentChildrenPosition = parentSyntaxListChildren.findIndex(x => x.getStart() === ifStatement.getStart() && x.getEnd() === ifStatement.getEnd())
  const isLastChild = parentChildrenPosition === parentSyntaxListChildren.length - 1

  if (isLastChild) return createItems(ifStatement)

  const nextSibling = parentSyntaxListChildren[parentChildrenPosition + 1]

  if (!nextSibling) return
  if (nextSibling.getKind() !== SyntaxKind.ReturnStatement) return

  return createItems(ifStatement)
}

function createItems(ifStatement: IfStatement): ResultItem[] {

  const sourceFile = ifStatement.getSourceFile()
  const ifKeyword = ifStatement.getChildrenOfKind(SyntaxKind.IfKeyword)[0]

  return [
    {
      code: CODE,
      filePath: sourceFile.getFilePath(),
      relativeFilePath: sourceFile.getBaseName(),
      line: ifKeyword.getStartLineNumber(),
      start: ifKeyword.getStart(),
      end: ifKeyword.getEnd(),
      message: 'Invert if statement to reduce nesting.',
      fix: createFix(ifStatement),
    },
  ]
}

function createFix(ifStatement: IfStatement): ResultItemFix | undefined {
  const parent = ifStatement.getParent()

  if (!parent) return

  const start = parent.getStart()
  const end = parent.getEnd()

  const binaryExpression = ifStatement.getChildrenOfKind(SyntaxKind.BinaryExpression)[0]
  const thenSyntaxList = ifStatement.getThenStatement()?.getChildrenOfKind(SyntaxKind.SyntaxList)[0]

  if (!(binaryExpression && thenSyntaxList)) return

  invertBinaryExpression(binaryExpression)

  ifStatement.setExpression(binaryExpression.getText())

  return {
    start,
    end,
    content: ifStatement.getText(),
  }
}

function invertBinaryExpression(binaryExpression: BinaryExpression) {
  switch (binaryExpression.getOperatorToken().getKind()) {
    // ==
    case SyntaxKind.EqualsEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} != ${binaryExpression.getRight().getText()}`)
      break
    }
    // ===
    case SyntaxKind.EqualsEqualsEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} !== ${binaryExpression.getRight().getText()}`)
      break
    }
    // !=
    case SyntaxKind.ExclamationEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} == ${binaryExpression.getRight().getText()}`)
      break
    }
    // !==
    case SyntaxKind.ExclamationEqualsEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} === ${binaryExpression.getRight().getText()}`)
      break
    }
    // >
    case SyntaxKind.GreaterThanToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} <= ${binaryExpression.getRight().getText()}`)
      break
    }
    // >=
    case SyntaxKind.GreaterThanEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} < ${binaryExpression.getRight().getText()}`)
      break
    }
    // <
    case SyntaxKind.LessThanToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} >= ${binaryExpression.getRight().getText()}`)
      break
    }
    // <=
    case SyntaxKind.LessThanEqualsToken: {
      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} > ${binaryExpression.getRight().getText()}`)
      break
    }
    // &&
    case SyntaxKind.AmpersandAmpersandToken: {
      // Apply De Morgan's law
      negateExpression(binaryExpression.getLeft())
      negateExpression(binaryExpression.getRight())

      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} || ${binaryExpression.getRight().getText()}`)
      break
    }
    // ||
    case SyntaxKind.BarBarToken: {
      // Apply De Morgan's law
      negateExpression(binaryExpression.getLeft())
      negateExpression(binaryExpression.getRight())

      binaryExpression.replaceWithText(`${binaryExpression.getLeft().getText()} && ${binaryExpression.getRight().getText()}`)
      break
    }
    // ??
    case SyntaxKind.QuestionQuestionToken: {
      binaryExpression.replaceWithText(`!(${binaryExpression.getLeft().getText()} ?? ${binaryExpression.getRight().getText()})`)
      break
    }
    default: {
      throw new Error(`Unsupported binary operator: ${binaryExpression.getOperatorToken().getKindName()}`)
    }
  }
}

function negateExpression(expression: Expression) {
  if (Node.isPrefixUnaryExpression(expression)) {
    if (expression.getOperatorToken() === SyntaxKind.ExclamationToken) {
      expression.replaceWithText(expression.getOperand().getText())

      return
    }
  }

  if (Node.isBinaryExpression(expression)) {
    invertBinaryExpression(expression)

    return
  }

  // TODO remove parenthesis
  expression.replaceWithText(`!(${expression.getText()})`)
}
