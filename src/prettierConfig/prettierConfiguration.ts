import { ConfigContainer } from '../parser';
import { findPrettierConfigurationFiles } from './prettierConfigFileParser';
import { Options } from 'prettier';

export function checkPrettierConfigurationUnicity(configurationFiles: ConfigContainer<Options>[]): boolean {
  if (configurationFiles.length > 1) {
    console.error(`ERROR: ${configurationFiles.length} multiple Prettier configurations detected in files:`);
    configurationFiles.forEach(({ fileName }) => {
      console.error(`    ${fileName}`);
    });
    return false;
  }
  return true;
}

export function checkPrettierConfigurationExistence(configurationFiles: ConfigContainer<Options>[]): boolean {
  if (configurationFiles.length === 0) {
    console.info('Skipping Prettier config as no config files have been found');
    return false;
  }
  return true;
}

export function checkPrettierConfiguration(dirPath: string): null | Options {
  const prettierConfigs = findPrettierConfigurationFiles(dirPath);

  if (!checkPrettierConfigurationExistence(prettierConfigs)) {
    return null;
  }

  if (!checkPrettierConfigurationUnicity(prettierConfigs)) {
    return null;
  }

  // Get the actual Prettier config
  const { config } = prettierConfigs[0];

  return config;
}
