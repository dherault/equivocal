import type ts from 'typescript'

export function getLineNumber(node: ts.Node) {
  return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1
}
