import path from 'node:path'

import ts from 'typescript'
import type { BinaryExpression, Expression, IfStatement, SyntaxList } from 'typescript'

import type { Executor, Project, ResultItem, ResultItemFix } from '~types'

import { getLineNumber } from '~helpers/getLineNumber'
import { getFirstChildOfKind } from '~helpers/children'
import { insertEmptyLine } from '~helpers/insertEmptyLine'
import { applySpacing, extractSpacing } from '~helpers/spacing'
import { formatIfStatements } from '~helpers/formatIfStatements'
import { appendIndentation, detectSyntaxListIndentation, detectTextTabSize, replaceIndentation } from '~helpers/indentation'
import { hasSemicolons, removeSemicolons } from '~helpers/semicolon'

const CODE = 'invert-if'
const MESSAGE = 'Invert if statement to reduce nesting.'

export const executor: Executor<IfStatement> = {
  code: CODE,
  name: 'Invert Ifs',
  onKind: ts.SyntaxKind.IfStatement,
  execute,
}

const RETURN_LIKE_KINDS: ts.SyntaxKind[] = [
  ts.SyntaxKind.ReturnStatement,
  ts.SyntaxKind.BreakStatement,
  ts.SyntaxKind.ContinueStatement,
  ts.SyntaxKind.ThrowStatement,
] as const

function execute(project: Project, ifStatement: ts.IfStatement): ResultItem[] | undefined {
  if (ifStatement.elseStatement) return

  const parentSyntaxListChildren = getFirstChildOfKind<SyntaxList>(ifStatement.parent, ts.SyntaxKind.SyntaxList)?.getChildren()

  if (!parentSyntaxListChildren?.length) return

  const ifStart = ifStatement.getStart()
  const ifEnd = ifStatement.getEnd()
  const parentIfIndex = parentSyntaxListChildren.findIndex(x => x.getStart() === ifStart && x.getEnd() === ifEnd)
  const isIfLastChild = parentIfIndex === parentSyntaxListChildren.length - 1

  if (isIfLastChild) return createItems(project, ifStatement)

  const nextSibling = parentSyntaxListChildren[parentIfIndex + 1]

  if (!nextSibling) return
  if (!RETURN_LIKE_KINDS.includes(nextSibling.kind)) return

  return createItems(project, ifStatement)
}

function createItems(project: Project, ifStatement: IfStatement): ResultItem[] | undefined {
  const keywordToken = ifStatement.getFirstToken()

  if (!keywordToken) return

  const sourceFile = ifStatement.getSourceFile()

  return [
    {
      code: CODE,
      message: MESSAGE,
      filePath: sourceFile.fileName,
      relativeFilePath: path.basename(sourceFile.fileName),
      line: getLineNumber(ifStatement),
      start: keywordToken.getStart(),
      end: keywordToken.getEnd(),
      fix: createFix(project, ifStatement),
    },
  ]
}

function createFix(project: Project, ifStatement: IfStatement): ResultItemFix | undefined {
  const start = ifStatement.parent.getStart()
  const end = ifStatement.parent.getEnd()

  const parentSyntaxList = getFirstChildOfKind<SyntaxList>(ifStatement.parent, ts.SyntaxKind.SyntaxList)
  const binaryExpression = getFirstChildOfKind<BinaryExpression>(ifStatement, ts.SyntaxKind.BinaryExpression)
  const thenSyntaxList = getFirstChildOfKind<SyntaxList>(ifStatement.thenStatement, ts.SyntaxKind.SyntaxList)

  if (!(parentSyntaxList && binaryExpression && thenSyntaxList)) return

  const ifStart = ifStatement.getStart()
  const ifEnd = ifStatement.getEnd()
  const previousStatements = parentSyntaxList.getChildren().filter(child => child.getEnd() < ifStart && ts.isStatement(child)) as ts.Statement[]
  const nextStatements = parentSyntaxList.getChildren().filter(child => child.getStart() > ifEnd && ts.isStatement(child)) as ts.Statement[]
  const thenStatements = thenSyntaxList.getChildren().filter(child => ts.isStatement(child)) as ts.Statement[]

  // Find out wether we need to invert with return or continue
  if (!nextStatements.length) {
    let { parent } = ifStatement

    while (
      ![
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.WhileStatement,
        ts.SyntaxKind.DoStatement,
        ts.SyntaxKind.ForStatement,
        ts.SyntaxKind.ForInStatement,
        ts.SyntaxKind.ForOfStatement,
        ts.SyntaxKind.CaseBlock,
      ].includes(parent.kind)
    ) {
      if (!parent.parent) return

      parent = parent.parent
    }

    switch (parent.kind) {
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement: {
        nextStatements.push(ts.factory.createContinueStatement())
        break
      }
      case ts.SyntaxKind.CaseBlock: {
        nextStatements.push(ts.factory.createBreakStatement())
        break
      }
      default: {
        nextStatements.push(ts.factory.createReturnStatement())
        break
      }
    }
  }

  const invertedIfStatement = ts.factory.createIfStatement(
    invertBinaryExpression(binaryExpression),
    nextStatements.length > 1 ? ts.factory.createBlock(nextStatements) : nextStatements[0],
  ) // No else statement

  const block = ts.factory.createBlock([
    ...previousStatements,
    invertedIfStatement,
    ...thenStatements,
  ])
  const sourceFileHasSemicolons = hasSemicolons(ifStatement.getSourceFile())
  const tabSize = detectTextTabSize(ifStatement.getSourceFile().getText())
  const indentation = detectSyntaxListIndentation(parentSyntaxList)
  const spacings = extractSpacing(ifStatement.parent.getText())

  let content = project.printer.printNode(
    ts.EmitHint.Unspecified,
    block,
    ifStatement.getSourceFile(),
  )
  const invertedIfStatementContent = project.printer.printNode(
    ts.EmitHint.Unspecified,
    invertedIfStatement,
    ifStatement.getSourceFile(),
  )

  content = insertEmptyLine(content, invertedIfStatementContent)

  // Must be before applySpacing, because spacings may not contain semicolons
  if (!sourceFileHasSemicolons) content = removeSemicolons(content)

  content = formatIfStatements(content)
  content = replaceIndentation(content, 4, tabSize)
  content = appendIndentation(content, indentation - tabSize, true)
  content = applySpacing(content, spacings)
  content = content.trimEnd()

  return {
    start,
    end,
    content,
  }
}

function invertBinaryExpression(binaryExpression: BinaryExpression): Expression {
  switch (binaryExpression.operatorToken.kind) {
    // ==
    case ts.SyntaxKind.EqualsEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken), // !=
        binaryExpression.right,
      )
    }
    // ===
    case ts.SyntaxKind.EqualsEqualsEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken), // !==
        binaryExpression.right,
      )
    }
    // !=
    case ts.SyntaxKind.ExclamationEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken), // ==
        binaryExpression.right,
      )
    }
    // !==
    case ts.SyntaxKind.ExclamationEqualsEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken), // ===
        binaryExpression.right,
      )
    }
    // >
    case ts.SyntaxKind.GreaterThanToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.LessThanEqualsToken), // <=
        binaryExpression.right,
      )
    }
    // >=
    case ts.SyntaxKind.GreaterThanEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.LessThanToken), // <
        binaryExpression.right,
      )
    }
    // <
    case ts.SyntaxKind.LessThanToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken), // >=
        binaryExpression.right,
      )
    }
    // <=
    case ts.SyntaxKind.LessThanEqualsToken: {
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        ts.factory.createToken(ts.SyntaxKind.GreaterThanToken), // >
        binaryExpression.right,
      )
    }
    // &&
    case ts.SyntaxKind.AmpersandAmpersandToken: {
      // Apply De Morgan's law
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        negateExpression(binaryExpression.left),
        ts.factory.createToken(ts.SyntaxKind.BarBarToken), // ||
        negateExpression(binaryExpression.right),
      )
    }
    // ||
    case ts.SyntaxKind.BarBarToken: {
      // Apply De Morgan's law
      return ts.factory.updateBinaryExpression(
        binaryExpression,
        negateExpression(binaryExpression.left),
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken), // ||
        negateExpression(binaryExpression.right),
      )
    }
    default: {
      return ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, binaryExpression)
    }
  }
}

function negateExpression(expression: Expression): Expression {
  if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.ExclamationToken) {
    return expression.operand
  }

  if (ts.isBinaryExpression(expression)) {
    return invertBinaryExpression(expression)
  }

  return ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, ts.isParenthesizedExpression(expression) ? expression.expression : expression)
}
