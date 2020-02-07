import { FileObject, checkFilePath, mapPath } from '../fileParser';
import { Linter } from 'eslint';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { checkESLINTConfiguration } from './checkEslintConfiguration';
import { ESLintConfigContainer } from './types';

const possibleESLintFiles: FileObject[] = [
  { name: '.eslintrc', extension: null },
  { name: '.eslintrc.json', extension: 'json' },
  { name: '.eslintrc.yaml', extension: 'yaml' }
];

function parseESLintConfigFiles(configFiles: FileObject[]): ESLintConfigContainer[] {
  return configFiles.map(configFile => {
    if (configFile.extension === 'json' || configFile.extension === null) {
      return { config: JSON.parse(readFileSync(configFile.name, 'utf-8')), fileName: configFile.name };
    } else {
      throw 'NO PARSER FOR YAML FILES DEFINED';
    }
  });
}

function findESLintConfigFiles(dirPath: string, possibleESLintFiles: FileObject[]): ESLintConfigContainer[] {
  const ESLintConfigPaths = possibleESLintFiles.map(mapPath(dirPath)).filter(checkFilePath);

  const ESLintConfigs = parseESLintConfigFiles(ESLintConfigPaths);

  const packageJSONPath = path.join(dirPath, 'package.json');

  // Check the package.json as well
  if (existsSync(packageJSONPath)) {
    const packageConfig = JSON.parse(readFileSync(packageJSONPath, 'utf-8'));
    if (packageConfig.eslintConfig) {
      ESLintConfigs.push({ config: packageConfig.eslintConfig, fileName: packageJSONPath });
    }
  }

  return ESLintConfigs;
}

export function findAndCheckESLintConfig(dirPath: string, usingPrettier: boolean): Linter.Config | null {
  const ESLintConfigs = findESLintConfigFiles(dirPath, possibleESLintFiles);

  if (ESLintConfigs.length > 1) {
    console.error(`ERROR: ${ESLintConfigs.length} multiple ESLINT configurations detected in files:`);
    ESLintConfigs.forEach(({ fileName }) => {
      console.error(`    ${fileName}`);
    });
    return null;
  }

  if (ESLintConfigs.length === 0) {
    console.info('Skipping ESLint config as no config files have been found');
    return null;
  }

  // Get the actual ESLint config
  const { config } = ESLintConfigs[0];

  const messages = checkESLINTConfiguration({ configuration: config, usingPrettier });
  console.log(messages);

  return config;
}
