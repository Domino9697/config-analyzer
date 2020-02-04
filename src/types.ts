export enum MessageType {
  INFO,
  WARN,
  ERROR
}

export interface Message {
  message: string;
  type: MessageType;
}
