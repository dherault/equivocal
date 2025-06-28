export type Spacing = {
  code: string
  emptyLinesAfter: number
}

export function extractSpacing(code: string) {
  const lines = code.split('\n')
  const spacings: Spacing[] = []
  let currentSpacing: Spacing = {
    code: '',
    emptyLinesAfter: 0,
  }

  while (lines.length > 0) {
    const currentLine = lines.shift()!

    if (!currentLine.trim()) {
      currentSpacing.emptyLinesAfter++
    }
    else if (currentSpacing.emptyLinesAfter) {
      spacings.push({ ...currentSpacing })
      currentSpacing = {
        code: currentLine,
        emptyLinesAfter: 0,
      }
    }
    else if (currentSpacing.code) {
      currentSpacing.code += `\n${currentLine}`
    }
    else {
      currentSpacing.code = currentLine
    }
  }

  spacings.push(currentSpacing)

  return spacings.filter(spacing => spacing.code.trim())
}

export function applySpacing(code: string, spacings: Spacing[]) {
  let result = code

  spacings.forEach(spacing => {
    const index = result.indexOf(spacing.code)

    if (index === -1) return

    const before = result.slice(0, index)
    const after = result.slice(index + spacing.code.length)
    const emptyLines = '\n'.repeat(spacing.emptyLinesAfter)

    result = `${before}${spacing.code}${emptyLines}${after}`
  })

  return `${result.trimEnd()}\n`
}
