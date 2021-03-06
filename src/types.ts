export enum MessageType {
  INFO,
  WARN,
  ERROR
}

export enum MessageCategory {
  ExtendsArrayOrder = 'extendsArrayOrder',
  ExtendsArrayRuleOverride = 'extendsArrayRuleOverride',
  MissingPrettierPlugin = 'missingPrettierPlugin',
  MultipleConfigurations = 'multipleConfigurations',
  NoLocalESLintIDESaveConfig = 'noLocalESLintIDESaveConfig',
  IDEInfo = 'IDEInfo',
  ESLintDisbaledInIDE = 'eslintDisbaledIDE',
  UnusedTool = 'UnusedTool'
}

export interface Message {
  message: string;
  type: MessageType;
  category: MessageCategory;
}
