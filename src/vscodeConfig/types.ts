import { WorkspaceConfiguration } from 'vscode';
import { ConfigContainer } from '../parser';

export interface VSCodeConfig {
  local: WorkspaceConfiguration | null;
  global: WorkspaceConfiguration | null;
}

export interface VSCodeConfigs {
  local: ConfigContainer<WorkspaceConfiguration>[];
  global: ConfigContainer<WorkspaceConfiguration>[];
}
