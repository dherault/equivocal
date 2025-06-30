export function insertEmptyLine(code: string, afterCode: string): string {
  const lines = code.split('\n')
  const afterLines = afterCode.split('\n')
  const index = lines.findIndex((_, i) => afterLines.every((afterLine, j) => lines[i + j].includes(afterLine)))

  if (index === -1) return code

  lines.splice(index + afterLines.length, 0, '')

  return lines.join('\n')
}
