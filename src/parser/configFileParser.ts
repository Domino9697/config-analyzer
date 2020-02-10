import { existsSync, readFileSync } from 'fs';
import { parse } from 'comment-json';
import path from 'path';
import { ConfigFileObject, ConfigContainer } from './types';

/**
 * Maps the FileObject name by joining its name with the dirname
 */
export function mapPath(dirPath: string): (filePath: ConfigFileObject) => ConfigFileObject {
  return (filePath: ConfigFileObject) => ({ ...filePath, name: path.join(dirPath, filePath.name) });
}

/**
 * Check if the filePath exists within the directory
 */
export function checkFilePath(filePath: ConfigFileObject): boolean {
  return existsSync(filePath.name);
}

/**
 * Check if the configjuration exists within file object
 */
export function checkIfConfigurationExists<T>(container: ConfigContainer<T>): boolean {
  return Boolean(container.config);
}

/**
 * Parse files according to their extensions
 */
export function parseConfigFiles<T>(configFiles: ConfigFileObject[], dirPath: string = ''): ConfigContainer<T>[] {
  return configFiles
    .map(mapPath(dirPath))
    .filter(checkFilePath)
    .map(configFile => {
      if (configFile.extension === 'json' || configFile.extension === null) {
        const configObject = parse(readFileSync(configFile.name, 'utf-8'), undefined, true);
        return {
          config: configFile.attribute ? configObject[configFile.attribute] : configObject,
          fileName: configFile.name
        };
      } else if (configFile.extension === 'yaml') {
        throw 'NO PARSER FOR YAML FILES DEFINED';
      } else if (configFile.extension === 'js') {
        const configObject = require(configFile.name);
        return {
          config: configFile.attribute ? configObject[configFile.attribute] : configObject,
          fileName: configFile.name
        };
      } else {
        throw `NO PARSER FOR ${configFile.extension} files found`;
      }
    })
    .filter(checkIfConfigurationExists);
}
