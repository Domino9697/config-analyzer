import { VSCodeConfigs, VSCodeConfig } from './types';
import { findVSCodeConfigFiles } from './vscodeConfigFileParser';

export function checkVSCodeConfigurationExistence(configurationFiles: VSCodeConfigs): boolean {
  if (configurationFiles.global.length === 0 && configurationFiles.local.length === 0) {
    console.info('Skipping VSCode config as no config files have been found');
    return false;
  } else if (configurationFiles.global.length === 0) {
    console.info('Skipping VSCode global config as no config files have been found');
  } else if (configurationFiles.local.length === 0) {
    console.info('Skipping VSCode local config as no config files have been found');
  }
  return true;
}

export function checkVSCodeConfigurationUnicity(configurationFiles: VSCodeConfigs): boolean {
  if (configurationFiles.local.length > 1) {
    console.error('Multiple VSCode settings found');
    return false;
  }
  return true;
}

export function checkVSCodeConfiguration(dirPath: string): null | VSCodeConfig {
  const VSCodeConfigFiles = findVSCodeConfigFiles(dirPath);

  if (!checkVSCodeConfigurationExistence) {
    return null;
  }

  if (!checkVSCodeConfigurationUnicity) {
    return null;
  }

  return {
    global: VSCodeConfigFiles.global[0]?.config,
    local: VSCodeConfigFiles.local[0]?.config
  };
}
