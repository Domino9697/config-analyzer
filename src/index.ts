import { existsSync } from 'fs';
import path from 'path';
import { checkESLintConfiguration } from './eslintPrettierConfig';
import { checkPrettierConfiguration } from './prettierConfig';
import { checkVSCodeConfiguration } from './vscodeConfig';

function main(): void {
  const args = process.argv.splice(2);

  if (args.length === 0) {
    console.log('No args found');
    process.exit(1);
  }

  const currentDir = process.cwd();

  const dirPath = path.join(currentDir, args[0]);

  if (!existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist`);
    process.exit(1);
  }

  const prettierConfig = checkPrettierConfiguration(dirPath);

  const eslintConfig = checkESLintConfiguration(dirPath, Boolean(prettierConfig));

  const VSCodeConfig = checkVSCodeConfiguration(dirPath);

  // console.log(VSCodeConfig);
}

main();
