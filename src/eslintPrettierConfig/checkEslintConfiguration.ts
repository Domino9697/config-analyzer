import { Message, MessageType } from "../types";
import { mapExtendsArray } from "./helpers";
import { Linter } from "eslint";
import { extendsObject, rulesObject } from "./types";
import { ESLintPrettierPlugins, ESLintPrettierWarningRules, ESLintPrettierErrorRules } from "./ESLintPrettierRules";

/**
 * Check if Prettier plugins are available and not installed and if they are extended in the right order
 * of the extends object
 */
export function applyExtendsArrayOrderRule(extendsObject: extendsObject, plugins: string[]): Message[] {
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
	  if (plugins.some(el => pluginKey.includes(el)) && prettierPosition === -1) {
		return errorMessages.concat({
		  message: `The rules of the ESLint ${rawName} plugin may conflict with Prettier. Extend the prettier/${pluginKey} eslint configuration to disable them`,
		  type: MessageType.ERROR
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
			type: MessageType.WARN
		  }));
  
		const errorRulesMessages = Object.keys(overrides)
		  .filter(ruleOverride => errorRules[pluginKey]?.includes(ruleOverride))
		  .map(rule => ({
			message: `${rule} is overriden in your ESlint config but was disabled by the prettier ${pluginKey}`,
			type: MessageType.ERROR
		  }));
  
		return messages.concat(warningRulesMessages, errorRulesMessages);
	  }, []);
  }
  

export function checkESLINTConfiguration(configuration: Linter.Config, usingPrettier: boolean): Message[] {
	const messages: Message[] = [];
  
	const extendsOption = configuration.extends;
	const ruleOverrides = configuration.rules;
  
	if (!extendsOption || typeof extendsOption === 'string' || !usingPrettier) {
	  return messages;
	}
  
	// Map the extends array to an object
	const extendsObject = mapExtendsArray(extendsOption);
  
	// Check for errors in the extends array order
	messages.concat(applyExtendsArrayOrderRule(extendsObject, ESLintPrettierPlugins));
  
	if (!ruleOverrides) {
	  return messages;
	}
  
	// Check if there are rules that override a prettier plugin rule
	messages.concat(applyNoFormattingOverrideRule(extendsObject, ruleOverrides, ESLintPrettierWarningRules, ESLintPrettierErrorRules));
  
	return messages;
  }