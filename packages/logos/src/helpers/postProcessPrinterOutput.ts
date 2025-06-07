import { detectLineIndentation } from '~helpers/detectIndentation'

export function postProcessPrinterOutput(
  output: string,
  baseIndentation: number,
  inputTabSize: number,
  desiredTabSize: number,
  trimFirstLine = false,
) {
  const lines = output
    .replace(/\s{4};\n/g, '\n') // Remove semicolons from ts.factory.createEmptyStatement()
    .split('\n')

  const firstIndentedLine = trimFirstLine ? lines[1] : lines[0]
  const firstIndentation = detectLineIndentation(firstIndentedLine)

  return lines
    .map((line, i) => {
      const trimmedLine = line.trim()

      if (i === 0 && trimFirstLine) return trimmedLine
      if (trimmedLine === '') return trimmedLine // Keep empty lines

      const lineIndentation = detectLineIndentation(line)
      const nTabs = lineIndentation / inputTabSize
      const adjustedIndentation = baseIndentation - firstIndentation / inputTabSize + nTabs * desiredTabSize - 1

      return ' '.repeat(adjustedIndentation) + trimmedLine
    })
    .join('\n')
}
