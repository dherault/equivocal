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

    if (currentLine.trim() === '') {
      currentSpacing.emptyLinesAfter++
    }
    else if (currentSpacing.emptyLinesAfter > 0) {
      spacings.push({ ...currentSpacing })
      currentSpacing = {
        code: currentLine,
        emptyLinesAfter: 0,
      }
    }
    else {
      currentSpacing.code += `\n${currentLine}`
    }
  }

  spacings.push(currentSpacing)

  return spacings
}
