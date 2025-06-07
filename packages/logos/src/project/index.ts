import { getTsconfig } from 'get-tsconfig'
import { Project } from 'ts-morph'

export function createProject(tsConfigPath?: string, skipAddingFilesFromTsConfig = false) {
  const finalTsConfigPath = tsConfigPath || getTsconfig()?.path

  if (!finalTsConfigPath) {
    throw new Error('Logos: No tsconfig file found')
  }

  const project = new Project({
    tsConfigFilePath: finalTsConfigPath,
    skipAddingFilesFromTsConfig,
  })

  return project
}

export function addSourceFileToProject(project: Project, filePath: string, fileContent: string) {
  project.createSourceFile(filePath, fileContent)
}
