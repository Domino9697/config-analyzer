import { Options } from 'prettier';

export interface PrettierConfigContainer {
  config: Options;
  fileName: string;
}
