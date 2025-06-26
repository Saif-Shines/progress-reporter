#!/usr/bin/env node

require('dotenv').config();
const { Command } = require('commander');
const chalk = require('chalk');
const {
  checkOpenPRs,
  checkMergedPRs,
} = require('./src/github-slack-integration');

const program = new Command();

program
  .name('weekly-updates')
  .description('Track GitHub PRs and send updates to Slack')
  .version('1.0.0');

program
  .command('open-prs')
  .description('Check for open PRs waiting for reviews and send to Slack')
  .action(async () => {
    try {
      console.log(chalk.blue('🔍 Checking for open PRs...'));
      await checkOpenPRs();
      console.log(chalk.green('✅ Open PRs check completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Error checking open PRs:'), error.message);
      process.exit(1);
    }
  });

program
  .command('merged-prs')
  .description('Check for merged PRs from the last few weeks and send to Slack')
  .option(
    '-w, --weeks <number>',
    'Number of weeks to look back (default: 2, max: 4)',
    '2'
  )
  .action(async (options) => {
    try {
      const weeks = parseInt(options.weeks);
      if (weeks < 1 || weeks > 4) {
        console.error(chalk.red('❌ Weeks must be between 1 and 4'));
        process.exit(1);
      }

      console.log(
        chalk.blue(`🔍 Checking merged PRs from the last ${weeks} week(s)...`)
      );
      await checkMergedPRs(weeks);
      console.log(chalk.green('✅ Merged PRs check completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Error checking merged PRs:'), error.message);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Run both open PRs and merged PRs checks')
  .option(
    '-w, --weeks <number>',
    'Number of weeks to look back for merged PRs (default: 2, max: 4)',
    '2'
  )
  .action(async (options) => {
    try {
      const weeks = parseInt(options.weeks);
      if (weeks < 1 || weeks > 4) {
        console.error(chalk.red('❌ Weeks must be between 1 and 4'));
        process.exit(1);
      }

      console.log(chalk.blue('🚀 Running all checks...\n'));

      console.log(chalk.blue('🔍 Checking for open PRs...'));
      await checkOpenPRs();
      console.log(chalk.green('✅ Open PRs check completed!\n'));

      console.log(
        chalk.blue(`🔍 Checking merged PRs from the last ${weeks} week(s)...`)
      );
      await checkMergedPRs(weeks);
      console.log(chalk.green('✅ Merged PRs check completed!'));

      console.log(chalk.green('\n🎉 All checks completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Error running checks:'), error.message);
      process.exit(1);
    }
  });

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse();
