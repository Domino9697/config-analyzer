import { existsSync } from 'fs';
import path from 'path';

export interface FileObject {
  name: string;
  extension: string | null;
}

/**
 * Maps the FileObject name by joining its name with the dirname
 */
export function mapPath(dirPath: string): (filePath: FileObject) => FileObject {
  return (filePath: FileObject) => ({ ...filePath, name: path.join(dirPath, filePath.name) });
}

/**
 * Check if the filePath exists within the directory
 */
export function checkFilePath(filePath: FileObject): boolean {
  return existsSync(filePath.name);
}
