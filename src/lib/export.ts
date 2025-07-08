import fs from 'fs-extra';
import path from 'path';
import * as csv from 'csv-writer';
import chalk from 'chalk';
import { ProjectInfo, UserPrompt } from '../types';
import { getSessionHistory } from './history';

export async function exportHistory(
  project: ProjectInfo,
  format: 'json' | 'csv' = 'json',
  outputPath?: string
): Promise<void> {
  try {
    const history = await getSessionHistory(project);
    
    if (history.length === 0) {
      console.log(chalk.yellow('No user prompts found to export'));
      return;
    }

    const projectName = project.name.replace(/\//g, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFileName = `claude-history-${projectName}-${timestamp}.${format}`;
    const filePath = outputPath || defaultFileName;

    if (format === 'json') {
      await exportToJson(history, filePath, project);
    } else if (format === 'csv') {
      await exportToCsv(history, filePath, project);
    }

    console.log(chalk.green(`History exported to: ${filePath}`));
    console.log(chalk.gray(`Exported ${history.length} prompts`));
  } catch (error) {
    console.error(chalk.red('Error exporting history:'), error);
  }
}

async function exportToJson(
  history: UserPrompt[],
  filePath: string,
  project: ProjectInfo
): Promise<void> {
  const exportData = {
    project: {
      name: project.name,
      path: project.path,
      sessionCount: project.sessionFiles.length
    },
    exportedAt: new Date().toISOString(),
    totalPrompts: history.length,
    prompts: history.map(prompt => ({
      uuid: prompt.uuid,
      sessionId: prompt.sessionId,
      content: prompt.content,
      timestamp: prompt.timestamp,
      cwd: prompt.cwd,
      date: new Date(prompt.timestamp).toLocaleString()
    }))
  };

  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
}

async function exportToCsv(
  history: UserPrompt[],
  filePath: string,
  project: ProjectInfo
): Promise<void> {
  const csvWriter = csv.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'uuid', title: 'UUID' },
      { id: 'sessionId', title: 'Session ID' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'date', title: 'Date' },
      { id: 'cwd', title: 'Working Directory' },
      { id: 'content', title: 'Prompt Content' }
    ]
  });

  const records = history.map(prompt => ({
    uuid: prompt.uuid,
    sessionId: prompt.sessionId,
    timestamp: prompt.timestamp,
    date: new Date(prompt.timestamp).toLocaleString(),
    cwd: prompt.cwd,
    content: prompt.content.replace(/\n/g, ' ').replace(/,/g, '，')
  }));

  await csvWriter.writeRecords(records);
}