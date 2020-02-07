import { FileObject, checkFilePath, mapPath } from '../fileParser';
import { readFileSync, existsSync } from 'fs';
import { PrettierConfigContainer } from './types';
import { Options } from 'prettier';

const possiblePrettierFiles: FileObject[] = [
  { name: '.prettierrc', extension: null },
  { name: '.prettierrc.json', extension: 'json' },
  { name: '.prettierrc.yaml', extension: 'yaml' }
];

function parsePrettierFiles(configFiles: FileObject[]): PrettierConfigContainer[] {
  return configFiles.map(configFile => {
    if (configFile.extension === 'json' || configFile.extension === null) {
      return { config: JSON.parse(readFileSync(configFile.name, 'utf-8')), fileName: configFile.name };
    } else {
      throw 'NO PARSER FOR YAML FILES DEFINED';
    }
  });
}

function findPrettierConfigFiles(dirPath: string, possiblePrettierFiles: FileObject[]): PrettierConfigContainer[] {
  const prettierConfigPaths = possiblePrettierFiles.map(mapPath(dirPath)).filter(checkFilePath);

  return parsePrettierFiles(prettierConfigPaths);

  // const packageJSONPath = path.join(dirPath, 'package.json');

  // // Check the package.json as well
  // if (existsSync(packageJSONPath)) {
  //   const packageConfig = JSON.parse(readFileSync(packageJSONPath, 'utf-8'));
  //   if (packageConfig.eslintConfig) {
  //     prettierConfigs.push({ config: packageConfig.eslintConfig, fileName: packageJSONPath });
  //   }
  // }

  // return prettierConfigs;
}

export function findAndCheckPrettierConfig(dirPath: string): null | Options {
  const prettierConfigs = findPrettierConfigFiles(dirPath, possiblePrettierFiles);

  if (prettierConfigs.length > 1) {
    console.error(`ERROR: ${prettierConfigs.length} multiple Prettier configurations detected in files:`);
    prettierConfigs.forEach(({ fileName }) => {
      console.error(`    ${fileName}`);
    });
    return null;
  }

  if (prettierConfigs.length === 0) {
    console.info('Skipping Prettier config analyzer because no prettier config found');
    return null;
  }

  // Get the actual ESLint config
  const { config } = prettierConfigs[0];
  return config;
}
