import { extendsObject } from "./types";

export function parseRawExtendElement(rawPlugin: string): string {
	return rawPlugin
	  .replace('plugin:', '')
	  .replace(':recommended', '')
	  .replace('/recommended', '');
  }

/**
 * Transforms the ESLint extends array in a more parsable extends object
 */
export function mapExtendsArray(extendsArray: string[]): extendsObject {
	return extendsArray.reduce<extendsObject>((_extendsObject, rawElement, index) => {
	  let element = parseRawExtendElement(rawElement);
	  const isPrettierPlugin = element.includes('prettier');
  
	  // If the plugin is simply Prettier, then it overrides the eslint Extend element
	  if (element === 'prettier') {
		element = 'eslint';
	  }
  
	  // Remove prettier/ from element
	  element = element.replace('prettier/', '');
  
	  const plugin = _extendsObject[element];
	  const rawName = isPrettierPlugin ? '' : rawElement;
  
	  if (!plugin) {
		return {
		  ..._extendsObject,
		  [element]: {
			position: isPrettierPlugin ? -1 : index,
			prettierPosition: isPrettierPlugin ? index : -1,
			rawName
		  }
		};
	  }
  
	  return {
		..._extendsObject,
		[element]: {
		  position: isPrettierPlugin ? plugin.position : index,
		  prettierPosition: isPrettierPlugin ? index : plugin.prettierPosition,
		  rawName
		}
	  };
	}, {});
  }