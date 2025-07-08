export interface ClaudeMessage {
  parentUuid: string | null;
  isSidechain: boolean;
  userType: string;
  cwd: string;
  sessionId: string;
  version: string;
  type: 'user' | 'assistant';
  message: {
    role: 'user' | 'assistant';
    content: string | any[];
    id?: string;
    model?: string;
  };
  uuid: string;
  timestamp: string;
}

export interface ProjectInfo {
  name: string;
  path: string;
  sessionFiles: string[];
}

export interface UserPrompt {
  uuid: string;
  sessionId: string;
  content: string;
  timestamp: string;
  cwd: string;
}

export interface ExportFormat {
  format: 'json' | 'csv';
  output: string;
}