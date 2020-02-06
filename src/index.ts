import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { findAndCheckESLintConfig } from './eslintPrettierConfig/ESLintConfigFileParser';
import { findAndCheckPrettierConfig } from './prettier/prettierConfigFileParser';

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

  findAndCheckESLintConfig(dirPath);

  findAndCheckPrettierConfig(dirPath);
}

main();
