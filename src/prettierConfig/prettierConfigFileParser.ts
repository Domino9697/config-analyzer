import { parseConfigFiles, ConfigFileObject } from '../parser';
import { Options } from 'prettier';

const possiblePrettierFiles: ConfigFileObject[] = [
  { name: '.prettierrc', extension: null },
  { name: '.prettierrc.json', extension: 'json' },
  { name: '.prettierrc.yaml', extension: 'yaml' },
  { name: 'package.json', extension: 'json', attribute: 'prettier' }
];

export function findPrettierConfigurationFiles(dirPath: string) {
  return parseConfigFiles<Options>(possiblePrettierFiles, dirPath);
}
