import path from 'node:path'

import ts from 'typescript'
import { getTsconfig } from 'get-tsconfig'

import type { Project } from '~types'

import { addSourceFileToProject } from '~project/addSourceFileToProject'

import { getTsDiagnosticMessage } from '~helpers/getTsDiagnosticMessage'

export function createProject(tsConfigPath?: string) {
  const finalTsConfigPath = tsConfigPath || getTsconfig()?.path

  if (!finalTsConfigPath) throw new Error(`No tsconfig file found at path "${finalTsConfigPath}"`)

  const configFile = ts.readConfigFile(finalTsConfigPath, ts.sys.readFile)

  if (configFile.error) throw new Error(getTsDiagnosticMessage(configFile.error))

  const project: Project = {
    sourceFiles: [],
    printer: ts.createPrinter({
      removeComments: false,
      newLine: ts.NewLineKind.LineFeed,
    }),
  }

  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(finalTsConfigPath)
  )

  parsedCommandLine.fileNames.forEach(filePath => {
    const fileContent = ts.sys.readFile(filePath)

    if (!fileContent) return

    addSourceFileToProject(project, filePath, fileContent)
  })

  return project
}
