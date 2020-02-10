export interface ConfigFileObject {
  name: string;
  extension: string | null;
  attribute?: string;
}

export interface ConfigContainer<T> {
  config: T;
  fileName: string;
}
