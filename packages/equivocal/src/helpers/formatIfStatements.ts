const regex = /if\s*\((.+)\)\n\s*(.+)/gm

export function formatIfStatements(code: string) {
  return code.replace(regex, (_match, condition, statement) => `if (${condition.trim()}) ${statement.trim()}`)
}
