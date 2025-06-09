import { detectLineIndentation } from '~helpers/detectIndentation'

export function postProcessPrinterOutput(
  output: string,
  baseIndentation: number,
  inputTabSize: number,
  desiredTabSize: number,
  trimFirstLine = false,
) {
  return output
    .replace(new RegExp(`^\\s{${baseIndentation}}$`, 'gm'), '\n') // Remove semicolons from ts.factory.createEmptyStatement()
    .split('\n')
    .map((line, i) => {
      const trimmedLine = line.trim()

      if (i === 0 && trimFirstLine) return trimmedLine
      if (trimmedLine === '') return trimmedLine // Keep empty lines

      return adjustLineIndentation(line, baseIndentation, inputTabSize, desiredTabSize)
    })
    .join('\n')
}

export function adjustLineIndentation(
  line: string,
  baseIndentation: number,
  inputTabSize: number,
  desiredTabSize: number
) {
  const lineIndentation = detectLineIndentation(line)
  const ratio = (desiredTabSize || inputTabSize || 2) / (inputTabSize || desiredTabSize || 2)

  if (line.trim() === 'return;') {
    console.log('y', JSON.stringify(line), lineIndentation, ratio, baseIndentation)
  }
  const adjustedIndentation = baseIndentation - lineIndentation

  return ' '.repeat(adjustedIndentation) + line
}
