import { Linter } from 'eslint';
import { ESLintPrettierPlugins, ESLintPrettierWarningRules, ESLintPrettierErrorRules } from './rules';

export function parseRawExtendElement(rawPlugin: string): string {
  return rawPlugin
    .replace('plugin:', '')
    .replace(':recommended', '')
    .replace('/recommended', '');
}

type extendsObject = { [index: string]: PluginData };

enum MessageType {
  INFO,
  WARN,
  ERROR
}

interface Message {
  message: string;
  type: MessageType;
}

interface PluginData {
  position: number;
  prettierPosition: number;
  rawName: string;
}

export function mapExtendsArray(extendsArray: string[]): extendsObject {
  return extendsArray.reduce<extendsObject>((_extendsObject, rawElement, index) => {
    let element = parseRawExtendElement(rawElement);
    const isPrettierPlugin = element.includes('prettier');

    // If the plugin is simply Prettier, then it overrides the eslint Extend element
    if (element === 'prettier') {
      element = 'eslint';
    }

    // Remove prettier/ from element
    element = element.replace('prettier/', '');

    const plugin = _extendsObject[element];
    const rawName = isPrettierPlugin ? '' : rawElement;

    if (!plugin) {
      return {
        ..._extendsObject,
        [element]: {
          position: isPrettierPlugin ? -1 : index,
          prettierPosition: isPrettierPlugin ? index : -1,
          rawName
        }
      };
    }

    return {
      ..._extendsObject,
      [element]: {
        position: isPrettierPlugin ? plugin.position : index,
        prettierPosition: isPrettierPlugin ? index : plugin.prettierPosition,
        rawName
      }
    };
  }, {});
}

export function applyExtendsArrayOrderRule(extendsObject: extendsObject): null | Message[] {
  return Object.keys(extendsObject).reduce<Message[]>((errorMessages, pluginKey) => {
    const { position, prettierPosition, rawName } = extendsObject[pluginKey];

    // Prettier Plugin is before actual Plugin
    if (prettierPosition < position && prettierPosition !== -1) {
      return errorMessages.concat({
        message: `${pluginKey} prettier plugin is called before the actual ${rawName} plugin in the ESLINT extends array`,
        type: MessageType.ERROR
      });
    }

    // Prettier Plugin is not installed
    if (ESLintPrettierPlugins.some(el => pluginKey.includes(el)) && prettierPosition === -1) {
      return errorMessages.concat({
        message: `The rules of the ESLint ${rawName} plugin may conflict with Prettier. Extend the prettier/${pluginKey} eslint configuration to disable them`,
        type: MessageType.ERROR
      });
    }

    return errorMessages;
  }, []);
}

export function applyNoFormattingOverrideRule(
  extendsObject: extendsObject,
  overrides: Partial<Linter.RulesRecord>
): null | Message[] {
  if (!overrides) {
    return null;
  }

  return Object.keys(extendsObject)
    .filter(pluginKey => extendsObject[pluginKey].prettierPosition !== -1)
    .reduce<Message[]>((messages, pluginKey) => {
      // Check if there are config overrides that are disabled by one of the Prettier plugins
      const warningRules = Object.keys(overrides)
        .filter(ruleOverride => ESLintPrettierWarningRules[pluginKey]?.includes(ruleOverride))
        .map(rule => ({
          message: `${rule} is overriden in your ESlint config but was disabled by the prettier ${pluginKey}`,
          type: MessageType.WARN
        }));

      const errorRules = Object.keys(overrides)
        .filter(ruleOverride => ESLintPrettierErrorRules[pluginKey]?.includes(ruleOverride))
        .map(rule => ({
          message: `${rule} is overriden in your ESlint config but was disabled by the prettier ${pluginKey}`,
          type: MessageType.ERROR
        }));

      return messages.concat(warningRules, errorRules);
    }, []);
}

export function checkESLINTConfiguration(configuration: Linter.Config, usingPrettier: boolean) {
  const extendsOption = configuration.extends;
  const ruleOverrides = configuration.rules;

  if (!extendsOption || typeof extendsOption === 'string' || !usingPrettier) {
    return;
  }

  const extendsObject = mapExtendsArray(extendsOption);

  const ESLintErrorMessages = applyExtendsArrayOrderRule(extendsObject);

  console.log(ESLintErrorMessages);

  if (!ruleOverrides) {
    return;
  }

  const ESLintRuleOverrideErrors = applyNoFormattingOverrideRule(extendsObject, ruleOverrides);

  console.log(ESLintRuleOverrideErrors);
}
