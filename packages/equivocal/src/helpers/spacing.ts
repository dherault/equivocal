import type { Spacing } from '~types'

export function extractSpacing(code: string) {
  const lines = code.split('\n')
  const spacing: Spacing = {}
  let currentLines = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) continue // Skip empty lines

    currentLines += `\n${line}`

    let before = 0
    let after = 0
    let cursor = 0

    while (typeof lines[i - cursor - 1] === 'string' && lines[i - cursor - 1].trim()) {
      cursor++
    }

    while (typeof lines[i - cursor - 1] === 'string' && !lines[i - cursor - 1].trim()) {
      before++
      cursor++
    }

    cursor = 0

    while (typeof lines[i + cursor + 1] === 'string' && !lines[i + cursor + 1].trim()) {
      after++
      cursor++
    }

    if (!after) continue

    spacing[currentLines.trimStart()] = {
      before,
      after,
    }
    currentLines = ''
  }

  return spacing
}

export function applySpacing(code: string, spacing: Spacing) {
  const lines = code.split('\n')
  const trimmedLines = lines.map(line => line.trim())

  Object.entries(spacing).forEach(([spacingCode, counts]) => {
    const workingTrimmedLines = spacingCode.split('\n')
    const startLineIndex = trimmedLines.findIndex((_, i) => (
      workingTrimmedLines.every((_, j) => trimmedLines[i + j] === workingTrimmedLines[j])
    ))

    if (startLineIndex === -1) return

    let linesBeforeCount = 0

    while (typeof lines[startLineIndex - linesBeforeCount - 1] === 'string' && !lines[startLineIndex - linesBeforeCount - 1].trim()) {
      linesBeforeCount++
    }

    const missingBeforeLinesCount = counts.before - linesBeforeCount

    if (missingBeforeLinesCount > 0) {
      const beforeArray = Array(missingBeforeLinesCount).fill('')

      lines.splice(startLineIndex, 0, ...beforeArray)
      trimmedLines.splice(startLineIndex, 0, ...beforeArray)
    }

    let linesAfterCount = 0

    while (typeof lines[startLineIndex + missingBeforeLinesCount + workingTrimmedLines.length + linesAfterCount] === 'string' && !lines[startLineIndex + missingBeforeLinesCount + workingTrimmedLines.length + linesAfterCount].trim()) {
      linesAfterCount++
    }

    const missingAfterLinesCount = counts.after - linesAfterCount

    if (missingAfterLinesCount > 0) {
      const afterArray = Array(missingAfterLinesCount).fill('')

      lines.splice(startLineIndex + missingBeforeLinesCount + workingTrimmedLines.length, 0, ...afterArray)
      trimmedLines.splice(startLineIndex + missingBeforeLinesCount + workingTrimmedLines.length, 0, ...afterArray)
    }
  })

  return lines.join('\n')
}
