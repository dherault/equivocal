import ts from 'typescript'
import type { SyntaxList } from 'typescript'

import { getFirstChildOfKind } from '~helpers/getFirstChildOfKind'

const INDENTATION_SIZES = [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function detectLineIndentation(line: string) {
  let indentCount = 0

  while (indentCount < line.length && (line[indentCount] === ' ' || line[indentCount] === '\t')) {
    indentCount++
  }

  return indentCount
}

export function detectBlockIndentation(block: ts.Block) {
  const syntaxList = getFirstChildOfKind<SyntaxList>(block, ts.SyntaxKind.SyntaxList)

  return syntaxList ? detectSyntaxListIndentation(syntaxList) : 0
}

export function detectSyntaxListIndentation(syntaxList: SyntaxList) {
  const line = syntaxList
    .getChildren()
    .find(child => child.kind !== ts.SyntaxKind.OpenBraceToken)
    ?.getFullText()
    .split('\n')
    .find(line => line.trim() !== '')

  if (!line) return 0

  return detectLineIndentation(line)
}

export function detectTextTabSize(text: string) {
  const indentations = text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => detectLineIndentation(line))

  if (!indentations.length) return 0

  // Return max denominator of all indentations
  return INDENTATION_SIZES.filter(size => indentations.every(x => !!x && x % size === 0))[0] ?? 0
}
