#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getProjects, getSessionHistory } from './lib/history';
import { exportHistory } from './lib/export';

const program = new Command();

program
  .name('chistory')
  .description('Claude history viewer CLI tool')
  .version('1.0.0');

program
  .command('list')
  .description('List all Claude projects')
  .action(async () => {
    try {
      const projects = await getProjects();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('No Claude projects found in ~/.claude/projects'));
        return;
      }

      console.log(chalk.blue.bold('Claude Projects:'));
      projects.forEach((project, index) => {
        console.log(`${chalk.green(`${index + 1}.`)} ${project.name}`);
        console.log(`   ${chalk.gray(`Sessions: ${project.sessionFiles.length}`)}`);
      });

      const { selectedIndex } = await inquirer.prompt([
        {
          type: 'number',
          name: 'selectedIndex',
          message: 'Select a project number to view history:',
          validate: (input) => {
            const num = parseInt(input);
            if (isNaN(num) || num < 1 || num > projects.length) {
              return `Please enter a number between 1 and ${projects.length}`;
            }
            return true;
          }
        }
      ]);

      const selectedProject = projects[selectedIndex - 1];
      await showProjectHistory(selectedProject);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('export')
  .description('Export history to JSON or CSV')
  .option('-f, --format <format>', 'Export format (json|csv)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    try {
      const projects = await getProjects();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('No Claude projects found'));
        return;
      }

      const { selectedIndex } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedIndex',
          message: 'Select a project to export:',
          choices: projects.map((project, index) => ({
            name: `${project.name} (${project.sessionFiles.length} sessions)`,
            value: index
          }))
        }
      ]);

      const selectedProject = projects[selectedIndex];
      await exportHistory(selectedProject, options.format, options.output);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
    }
  });

async function showProjectHistory(project: any) {
  try {
    const history = await getSessionHistory(project);
    
    if (history.length === 0) {
      console.log(chalk.yellow('No user prompts found in this project'));
      return;
    }

    console.log(chalk.blue.bold(`\nHistory for ${project.name}:`));
    console.log(chalk.gray(`Found ${history.length} prompts\n`));

    history.forEach((prompt, index) => {
      const date = new Date(prompt.timestamp).toLocaleString();
      const preview = prompt.content.length > 100 
        ? prompt.content.substring(0, 100) + '...'
        : prompt.content;
      
      console.log(`${chalk.green(`${index + 1}.`)} ${chalk.cyan(date)}`);
      console.log(`   ${chalk.white(preview)}`);
      console.log(`   ${chalk.gray(`Session: ${prompt.sessionId.substring(0, 8)}... | CWD: ${prompt.cwd}`)}`);
      console.log();
    });
  } catch (error) {
    console.error(chalk.red('Error showing history:'), error);
  }
}

if (require.main === module) {
  program.parse();
}