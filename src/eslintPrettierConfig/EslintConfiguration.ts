import { Message, MessageType, MessageCategory } from '../types';
import { mapExtendsArray } from './helpers';
import { Linter } from 'eslint';
import { extendsObject, rulesObject } from './types';
import * as EslintPrettierRules from './ESLintPrettierRules';
import { ConfigFileObject, ConfigContainer } from '../parser';
import { findESLintConfigurationFiles } from './ESLintConfigFileParser';

/**
 * Check if Prettier plugins are available and not installed and if they are extended in the right order
 * of the extends object
 */
export function applyExtendsArrayOrderRule(extendsObject: extendsObject, plugins: string[]): Message[] {
  return Object.keys(extendsObject).reduce<Message[]>((errorMessages, pluginKey) => {
    const { position, prettierPosition, pluginName, prettierPluginName } = extendsObject[pluginKey];

    // Prettier Plugin is before actual Plugin
    if (prettierPosition < position && prettierPosition !== -1) {
      return errorMessages.concat({
        message: `${pluginKey} prettier plugin is called before the actual ${pluginName} plugin in the ESLINT extends array`,
        type: MessageType.ERROR,
        category: MessageCategory.ExtendsArrayOrder
      });
    }

    // Prettier Plugin is not installed
    if (plugins.some(el => pluginKey.includes(el)) && prettierPosition === -1) {
      return errorMessages.concat({
        message: `The rules of the ESLint ${pluginName} plugin may conflict with Prettier. Extend the ${prettierPluginName} eslint configuration to disable them`,
        type: MessageType.ERROR,
        category: MessageCategory.MissingPrettierPlugin
      });
    }

    return errorMessages;
  }, []);
}

/**
 * Check if the overrides object contains rules that override the warning and error rules of
 * prettier plugins contained in the extendsObject
 */
export function applyNoFormattingOverrideRule(
  extendsObject: extendsObject,
  overrides: Partial<Linter.RulesRecord>,
  warningRules: rulesObject,
  errorRules: rulesObject
): Message[] {
  return Object.keys(extendsObject)
    .filter(pluginKey => extendsObject[pluginKey].prettierPosition !== -1)
    .reduce<Message[]>((messages, pluginKey) => {
      // Check if there are config overrides that are disabled by one of the Prettier plugins
      const warningRulesMessages = Object.keys(overrides)
        .filter(ruleOverride => warningRules[pluginKey]?.includes(ruleOverride))
        .map(rule => ({
          message: `${rule} is overriden in your ESlint config but was disabled by the prettier ${pluginKey}`,
          type: MessageType.WARN,
          category: MessageCategory.ExtendsArrayRuleOverride
        }));

      const errorRulesMessages = Object.keys(overrides)
        .filter(ruleOverride => errorRules[pluginKey]?.includes(ruleOverride))
        .map(rule => ({
          message: `${rule} is overriden in your ESlint config but was disabled by the prettier ${pluginKey}`,
          type: MessageType.ERROR,
          category: MessageCategory.ExtendsArrayRuleOverride
        }));

      return messages.concat(warningRulesMessages, errorRulesMessages);
    }, []);
}

interface checkESLINTConfigurationParams {
  configuration: Linter.Config;
  usingPrettier: boolean;
  ESLintPrettierPlugins?: string[];
  ESLintPrettierWarningRules?: rulesObject;
  ESLintPrettierErrorRules?: rulesObject;
}

export function checkESLINTConfigurationRules({
  configuration,
  usingPrettier,
  ESLintPrettierErrorRules = EslintPrettierRules.ESLintPrettierErrorRules,
  ESLintPrettierPlugins = EslintPrettierRules.ESLintPrettierPlugins,
  ESLintPrettierWarningRules = EslintPrettierRules.ESLintPrettierWarningRules
}: checkESLINTConfigurationParams): Message[] {
  let messages: Message[] = [];

  const extendsOption = configuration.extends;
  const ruleOverrides = configuration.rules;

  if (!extendsOption || typeof extendsOption === 'string' || !usingPrettier) {
    return messages;
  }

  // Map the extends array to an object
  const extendsObject = mapExtendsArray(extendsOption);

  // Check for errors in the extends array order
  messages = messages.concat(applyExtendsArrayOrderRule(extendsObject, ESLintPrettierPlugins));

  if (!ruleOverrides) {
    return messages;
  }

  // Check if there are rules that override a prettier plugin rule
  messages = messages.concat(
    applyNoFormattingOverrideRule(extendsObject, ruleOverrides, ESLintPrettierWarningRules, ESLintPrettierErrorRules)
  );

  return messages;
}

export function checkESLintConfigurationUnicity(configurationFiles: ConfigContainer<Linter.Config>[]): boolean {
  if (configurationFiles.length > 1) {
    // Log that there is an issue
    console.error(`ERROR: ${configurationFiles.length} multiple ESLINT configurations detected in files:`);
    configurationFiles.forEach(({ fileName }) => {
      console.error(`    ${fileName}`);
    });
    return false;
  }
  return true;
}

export function checkESLintConfigurationExistence(configurationFiles: ConfigContainer<Linter.Config>[]): boolean {
  if (configurationFiles.length === 0) {
    console.info('Skipping ESLint config as no config files have been found');
    return false;
  }
  return true;
}

export function checkESLintConfiguration(dirPath: string, usingPrettier: boolean): null | Linter.Config {
  const ESLintConfigs = findESLintConfigurationFiles(dirPath);

  if (!checkESLintConfigurationExistence(ESLintConfigs)) {
    return null;
  }

  if (!checkESLintConfigurationUnicity(ESLintConfigs)) {
    return null;
  }

  // Get the actual ESLint config
  const { config } = ESLintConfigs[0];

  const messages = checkESLINTConfigurationRules({ configuration: config, usingPrettier });
  console.log(messages);

  return config;
}
