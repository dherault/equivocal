import type { Project, ResultItem } from '~types'

export function applyFix(project: Project, resultItem: ResultItem) {
  if (!resultItem.fix) throw new Error('No fix available for this result item')

  const file = project.sourceFiles.find(f => f.fileName === resultItem.filePath)

  if (!file) throw new Error(`File not found: ${resultItem.filePath}`)

  const text = file.getFullText()

  return text.slice(0, resultItem.fix.start) + resultItem.fix.content + text.slice(resultItem.fix.end)
}
