import { Message } from './types';

export interface MessageController {
  addMessage: (key: string, message: Message[] | Message) => void;
  printMessages: () => void;
}

export const messageController = ((): MessageController => {
  const messages: { [key: string]: Message[] } = {};
  return {
    addMessage: (key, newMessages) => {
      if (!messages[key]) {
        messages[key] = [];
      }
      if (newMessages instanceof Array) {
        messages[key] = [...messages[key], ...newMessages];
        return;
      }
      messages[key] = [...messages[key], newMessages];
    },
    printMessages: () => {
      for (const key in messages) {
        console.log();
        console.log(`-------------${key}----------`);
        messages[key].forEach(messageContainer => {
          console.log();
          console.log(`${messageContainer.category}:`);
          console.log(`${messageContainer.message}`);
        });
      }
      console.log();
    }
  };
})();
