import { VSCodeConfigs, VSCodeConfig } from './types';
import { findVSCodeConfigFiles } from './vscodeConfigFileParser';
import { MessageController } from '../messages';
import { MessageCategory, MessageType } from '../types';

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
    return false;
  }
  return true;
}

export function checkVSCodeConfiguration(dirPath: string, messageController: MessageController): null | VSCodeConfig {
  const VSCodeConfigFiles = findVSCodeConfigFiles(dirPath);

  if (!checkVSCodeConfigurationExistence) {
    return null;
  }

  if (!checkVSCodeConfigurationUnicity) {
    messageController.addMessage('VSCode', {
      category: MessageCategory.MultipleConfigurations,
      type: MessageType.ERROR,
      message: `ERROR: ${VSCodeConfigFiles.local.length} multiple VSCode configurations detected in files:
          ${VSCodeConfigFiles.local.map(({ fileName }) => fileName)}
      `
    });
    return null;
  }

  return {
    global: VSCodeConfigFiles.global[0]?.config,
    local: VSCodeConfigFiles.local[0]?.config
  };
}
