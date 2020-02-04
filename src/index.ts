import { existsSync, readFileSync } from "fs";
import path from "path";
import { checkESLINTConfiguration } from "./eslintPrettierConfig";

function findAndCheckESLINTCOnfig(dirPath: string): void {
  const filePath = path.join(dirPath, ".eslintrc");

  // Find eslintrc file
  if (!existsSync(filePath)) {
    console.log("No ESLINT config file found");
    return;
  }

  const rawConfig = readFileSync(filePath, 'utf8');

  console.log(checkESLINTConfiguration(JSON.parse(rawConfig), true));
}

function main(): void {
  const args = process.argv.splice(2);

  if (args.length === 0) {
    console.log("No args found");
    process.exit(1);
  }

  const currentDir = process.cwd();

  const dirPath = path.join(currentDir, args[0]);

  if (!existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist`);
    process.exit(1);
  }

  findAndCheckESLINTCOnfig(dirPath);
}

main();
