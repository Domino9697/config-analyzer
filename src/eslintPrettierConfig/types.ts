import { Linter } from 'eslint';
import { ConfigContainer } from '../parser';

interface PluginData {
  position: number;
  prettierPosition: number;
  pluginName: string;
  prettierPluginName: string;
}

export type extendsObject = { [index: string]: PluginData };

export type rulesObject = { [index: string]: string[] | undefined };

export type ESLintConfigContainer = ConfigContainer<Linter.Config>;
