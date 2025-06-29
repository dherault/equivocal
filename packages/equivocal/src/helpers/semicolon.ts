import ts from 'typescript'

export function isUsingSemicolons(sourceFile: ts.SourceFile) {
  let withSemicolon = 0
  let withoutSemicolon = 0

  const visit = (node: ts.Node) => {
    if (
      ts.isExpressionStatement(node)
      || ts.isVariableStatement(node)
      || ts.isReturnStatement(node)
      || ts.isBreakStatement(node)
      || ts.isContinueStatement(node)
      || ts.isThrowStatement(node)
    ) {
      const text = node.getFullText(sourceFile).trim()

      if (text.endsWith(';')) {
        withSemicolon++
      }
      else {
        withoutSemicolon++
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return withSemicolon / (withSemicolon + withoutSemicolon) >= 0.5
}

export function removeSemicolons(code: string) {
  return code.replace(/;(?=\s*(?:\n|$|\}))/g, '')
}
