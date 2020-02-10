import { Linter } from 'eslint';
import { ConfigFileObject, parseConfigFiles } from '../parser';

const possibleESLintFiles: ConfigFileObject[] = [
  { name: '.eslintrc', extension: null },
  { name: '.eslintrc.json', extension: 'json' },
  { name: '.eslintrc.yaml', extension: 'yaml' },
  { name: 'package.json', extension: 'json', attribute: 'eslintConfig' }
];

export function findESLintConfigurationFiles(dirPath: string) {
  return parseConfigFiles<Linter.Config>(possibleESLintFiles, dirPath);
}
