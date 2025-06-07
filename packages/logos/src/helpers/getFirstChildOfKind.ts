import type ts from 'typescript'

import { getChildrenOfKind } from '~helpers/getChildrenOfKind'

export function getFirstChildOfKind<T extends ts.Node>(node: ts.Node | undefined, kind: ts.SyntaxKind): T | undefined {
  return getChildrenOfKind<T>(node, kind)[0]
}
