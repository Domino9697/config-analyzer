export enum MessageType {
  INFO,
  WARN,
  ERROR
}

export enum MessageCategory {
  ExtendsArrayOrder = 'extendsArrayOrder',
  ExtendsArrayRuleOverride = 'extendsArrayRuleOverride',
  MissingPrettierPlugin = 'missingPrettierPlugin'
}

export interface Message {
  message: string;
  type: MessageType;
  category: MessageCategory;
}
