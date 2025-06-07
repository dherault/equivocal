import type ts from 'typescript'

export function getChildrenOfKind<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T[] {
  return node.getChildren().filter(child => child.kind === kind) as T[]
}
