import type { Node, SyntaxList } from 'typescript'

import { getLineNumber } from '~helpers/getLineNumber'

const INDENTATION_SIZES = [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function detectNodeIndentation(node: Node) {
  const line = node.getSourceFile().getFullText().split('\n')[getLineNumber(node) - 1]

  return detectLineIndentation(line)
}

export function detectLineIndentation(line: string) {
  let indentCount = 0

  while (indentCount < line.length && (line[indentCount] === ' ' || line[indentCount] === '\t')) {
    indentCount++
  }

  return indentCount
}

export function detectSyntaxListIndentation(syntaxList: SyntaxList) {
  const firstChild = syntaxList.getChildren()[0]

  return firstChild ? detectNodeIndentation(firstChild) : 0
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
