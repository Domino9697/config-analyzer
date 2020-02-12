import { ConfigContainer } from '../parser';
import { findPrettierConfigurationFiles } from './prettierConfigFileParser';
import { Options } from 'prettier';
import { MessageController } from '../messages';
import { MessageCategory, MessageType } from '../types';

export function checkPrettierConfigurationUnicity(configurationFiles: ConfigContainer<Options>[]): boolean {
  if (configurationFiles.length > 1) {
    return false;
  }
  return true;
}

export function checkPrettierConfigurationExistence(configurationFiles: ConfigContainer<Options>[]): boolean {
  if (configurationFiles.length === 0) {
    return false;
  }
  return true;
}

export function checkPrettierConfiguration(dirPath: string, messageController: MessageController): null | Options {
  const prettierConfigs = findPrettierConfigurationFiles(dirPath);

  if (!checkPrettierConfigurationExistence(prettierConfigs)) {
    messageController.addMessage('Prettier', {
      category: MessageCategory.UnusedTool,
      type: MessageType.INFO,
      message: `Skipping Prettier config as no config files have been found`
    });
    return null;
  }

  if (!checkPrettierConfigurationUnicity(prettierConfigs)) {
    messageController.addMessage('Prettier', {
      category: MessageCategory.MultipleConfigurations,
      type: MessageType.ERROR,
      message: `ERROR: ${prettierConfigs.length} multiple Prettier configurations detected in files:
          ${prettierConfigs.map(({ fileName }) => fileName)}
      `
    });
    return null;
  }

  // Get the actual Prettier config
  const { config } = prettierConfigs[0];

  return config;
}
