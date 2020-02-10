import { parseConfigFiles } from '../parser';
import { WorkspaceConfiguration } from 'vscode';
import { VSCodeConfigs } from './types';

const homedir = require('os').homedir();
const possibleLocalVSCodeFiles = [{ name: '.vscode/settings.json', extension: 'json' }];
const possibleGlobalVSCodeFiles = [
  { name: `${homedir}/Library/Application Support/Code/User/settings.json`, extension: 'json' },
  { name: `${homedir}/Library/Application Support/Code - Insiders/User/settings.json`, extension: 'json' },
  { name: `${homedir}/.config/Code/User/settings.json`, extension: 'json' },
  { name: `${homedir}/.config/Code - Insiders/User/settings.json`, extension: 'json' }
];

function findGlobalVSCodeConfigFiles() {
  return parseConfigFiles<WorkspaceConfiguration>(possibleGlobalVSCodeFiles);
}

function findLocalVSCodeConfigFiles(dirPath: string) {
  return parseConfigFiles<WorkspaceConfiguration>(possibleLocalVSCodeFiles, dirPath);
}

export function findVSCodeConfigFiles(dirPath: string): VSCodeConfigs {
  return {
    global: findGlobalVSCodeConfigFiles(),
    local: findLocalVSCodeConfigFiles(dirPath)
  };
}
