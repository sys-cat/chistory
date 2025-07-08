import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ProjectInfo, ClaudeMessage, UserPrompt } from '../types';

const CLAUDE_PROJECTS_PATH = path.join(os.homedir(), '.claude', 'projects');

export async function getProjects(): Promise<ProjectInfo[]> {
  try {
    if (!await fs.pathExists(CLAUDE_PROJECTS_PATH)) {
      return [];
    }

    const projectDirs = await fs.readdir(CLAUDE_PROJECTS_PATH);
    const projects: ProjectInfo[] = [];

    for (const dir of projectDirs) {
      const projectPath = path.join(CLAUDE_PROJECTS_PATH, dir);
      const stat = await fs.stat(projectPath);

      if (stat.isDirectory()) {
        const sessionFiles = await fs.readdir(projectPath);
        const jsonlFiles = sessionFiles.filter(file => file.endsWith('.jsonl'));

        projects.push({
          name: formatProjectName(dir),
          path: projectPath,
          sessionFiles: jsonlFiles
        });
      }
    }

    return projects.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error reading Claude projects:', error);
    return [];
  }
}

export async function getSessionHistory(project: ProjectInfo): Promise<UserPrompt[]> {
  const prompts: UserPrompt[] = [];

  for (const sessionFile of project.sessionFiles) {
    const sessionPath = path.join(project.path, sessionFile);
    
    try {
      const content = await fs.readFile(sessionPath, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          const message: ClaudeMessage = JSON.parse(line);
          
          if (message.type === 'user' && message.message.role === 'user') {
            let content = '';
            
            if (typeof message.message.content === 'string') {
              content = message.message.content;
            } else if (Array.isArray(message.message.content)) {
              content = message.message.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join(' ');
            }

            if (content.trim()) {
              prompts.push({
                uuid: message.uuid,
                sessionId: message.sessionId,
                content: content.trim(),
                timestamp: message.timestamp,
                cwd: message.cwd
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading session file ${sessionFile}:`, error);
    }
  }

  return prompts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function formatProjectName(dirName: string): string {
  return dirName
    .replace(/^-/, '')
    .replace(/-/g, '/')
    .replace(/^mnt\/c\/Users\/Owner\/Develop\//, '')
    .replace(/^\//, '');
}