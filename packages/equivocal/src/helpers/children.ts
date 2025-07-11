import type ts from 'typescript'

export function getChildrenOfKind<T extends ts.Node>(node: ts.Node | undefined, kind: ts.SyntaxKind): T[] {
  return (node?.getChildren().filter(child => child.kind === kind) ?? []) as T[]
}

export function getFirstChildOfKind<T extends ts.Node>(node: ts.Node | undefined, kind: ts.SyntaxKind): T | undefined {
  return getChildrenOfKind<T>(node, kind)[0]
}
