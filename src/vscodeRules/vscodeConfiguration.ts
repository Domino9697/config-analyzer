import { VSCodeConfig } from '../vscodeConfig/types';
import { Linter } from 'eslint';
import { WorkspaceConfiguration } from 'vscode';
import { Message, MessageType, MessageCategory } from '../types';

function findESLintEnabledRule(config: WorkspaceConfiguration | null): undefined | boolean {
  return config?.['eslint.enabled'];
}

/**
 * Returns messages if the VSCode ESLINT configuraion has been disabled either locally or globally
 */
export function applyESLintEnabledRule({ global, local }: VSCodeConfig): Message[] {
  const messages: Message[] = [];

  const localESLintEnabledConfig = findESLintEnabledRule(local);
  const globalESLintEnabledConfig = findESLintEnabledRule(global);

  if (!localESLintEnabledConfig && globalESLintEnabledConfig === false) {
    messages.push({
      category: MessageCategory.ESLintDisbaledInIDE,
      type: MessageType.WARN,
      message: `Your ESLint extension is disabled in your user settings. Consider enabling it project wise or change the global setting.`
    });
  } else if (localESLintEnabledConfig === false) {
    messages.push({
      category: MessageCategory.ESLintDisbaledInIDE,
      type: MessageType.WARN,
      message: `ESLint is disabled in your IDE because of the 'eslint.enabled' property in your vscode local configuration. Consider removing this or setting the property to 'true'`
    });
  }

  return messages;
}

function findFixESLintOnSaveRule(config: WorkspaceConfiguration | null): undefined | boolean {
  const saveConfig = config?.['editor.codeActionsOnSave'];
  if (saveConfig) {
    return saveConfig['source.fixAll.eslint'] || saveConfig['source.fixAll'];
  }
  return undefined;
}

/**
 * Returns messages if the fix ESLINT on save was not activated in the VSCode configuration
 */
export function applyFixESLintOnSaveRule({ global, local }: VSCodeConfig): Message[] {
  const messages: Message[] = [];
  const localSaveConfig = findFixESLintOnSaveRule(local);
  const globalSaveConfig = findFixESLintOnSaveRule(global);

  if (globalSaveConfig && localSaveConfig === undefined) {
    messages.push({
      type: MessageType.WARN,
      category: MessageCategory.NoLocalESLintIDESaveConfig,
      message: `Your ESlint errors will be fixed in VSCode on save because of the 'editor.codeActionsOnSave' property registered globally. Consider adding this to the local VSCode settings so other developers also benefit from this.`
    });
  } else if (localSaveConfig) {
    messages.push({
      type: MessageType.INFO,
      category: MessageCategory.IDEInfo,
      message: `Your IDE will fix your ESLint errors on save.`
    });
  } else if (localSaveConfig === false) {
    messages.push({
      category: MessageCategory.NoLocalESLintIDESaveConfig,
      type: MessageType.WARN,
      message: `Your ESLint errors will not be fixed automatically on save because of the 'editor.codeActionsOnSave' property set to false locally.`
    });
  } else {
    messages.push({
      type: MessageType.WARN,
      category: MessageCategory.NoLocalESLintIDESaveConfig,
      message: `Your ESLint errors will not be automatically fixed on save. Consider adding the 'editor.codeActionsOnSave' property in your workspace settings.`
    });
  }

  return messages;
}

export function applyVSCodeESLintConfigurationRules(vscodeConfig: VSCodeConfig, ESLintConfig: Linter.Config): Message[] {
  return [applyESLintEnabledRule, applyFixESLintOnSaveRule].reduce<Message[]>(
    (errorMessages, applyRule) => {
      return errorMessages.concat(applyRule(vscodeConfig));
    },
    []
  );
}
