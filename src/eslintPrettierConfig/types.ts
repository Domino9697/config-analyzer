interface PluginData {
	position: number;
	prettierPosition: number;
	rawName: string;
  }

export type extendsObject = { [index: string]: PluginData };

export type rulesObject = { [index: string]: string[] | undefined };