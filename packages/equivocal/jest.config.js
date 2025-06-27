import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} * */
export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '~(.*)': '<rootDir>/src/$1',
  },
  transform: {
    ...tsJestTransformCfg,
  },
}
