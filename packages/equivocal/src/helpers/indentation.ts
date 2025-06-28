import ts from 'typescript'
import type { SyntaxList } from 'typescript'

const INDENTATION_SIZES = [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function detectLineIndentation(line: string) {
  let indentCount = 0

  while (indentCount < line.length && (line[indentCount] === ' ' || line[indentCount] === '\t')) {
    indentCount++
  }

  return indentCount
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

  if (indentations.length === 0) return 0
  if (indentations.length === 1) return indentations[0]

  // Return max denominator of all indentations
  return INDENTATION_SIZES.filter(size => indentations.every(x => x % size === 0))[0] ?? 0
}

export function appendIndentation(code: string, indentation: number, skipFirstLine = false): string {
  const indentationCode = ' '.repeat(indentation)

  return code
    .split('\n')
    .map((line, i) => {
      if (skipFirstLine && i === 0) return line // Skip first line
      if (line.trim() === '') return line // Preserve empty lines

      return indentationCode + line
    })
    .join('\n')
}

export function replaceIndentation(code: string, indentationStart: number, indentationEnd: number) {
  const startIndentationCode = ' '.repeat(indentationStart)
  const endIndentationCode = ' '.repeat(indentationEnd)

  return code.split('\n').map(line => {
    let finalLine = line

    while (line.startsWith(startIndentationCode)) {

      finalLine = finalLine.replace(startIndentationCode, endIndentationCode)

      line = line.slice(startIndentationCode.length)
    }

    return finalLine
  })
  .join('\n')
}
