import ts from 'typescript'

export function getTsDiagnosticMessage(error: ts.Diagnostic) {
  return ts.formatDiagnosticsWithColorAndContext([error], {
    getCanonicalFileName: f => f,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  })
}
