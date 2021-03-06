import { existsSync } from 'fs';
import path from 'path';
import { checkESLintConfiguration } from './eslintPrettierConfig';
import { checkPrettierConfiguration } from './prettierConfig';
import { checkVSCodeConfiguration } from './vscodeConfig';
import { applyVSCodeESLintConfigurationRules } from './vscodeRules';
import { Message } from './types';

import { messageController } from "./messages";

function main(): void {
  const args = process.argv.splice(2);

  if (args.length === 0) {
    console.log('No args found');
    process.exit(1);
  }

  const currentDir = process.cwd();
  const inputPath = args[0];

  const dirPath = existsSync(inputPath) ? inputPath : path.join(currentDir, inputPath);

  if (!existsSync(dirPath)) {
    console.log(`Neither ${inputPath} or ${dirPath} directories exist`);
    process.exit(1);
  }

  const prettierConfig = checkPrettierConfiguration(dirPath, messageController);

  const eslintConfig = checkESLintConfiguration(dirPath, Boolean(prettierConfig), messageController);

  const VSCodeConfig = checkVSCodeConfiguration(dirPath, messageController);

  if (VSCodeConfig && eslintConfig) {
    const VSCodeMessages = applyVSCodeESLintConfigurationRules(VSCodeConfig, eslintConfig);
    messageController.addMessage('ESLINT_VSCode', VSCodeMessages)
  }

  messageController.printMessages();
}

main();
