#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Welcome to Weekly Updates Setup!\n');
  console.log('This will help you configure your environment variables.\n');

  const envPath = path.join(__dirname, '.env');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question(
      '⚠️  .env file already exists. Overwrite? (y/N): '
    );
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 GitHub Configuration:');
  console.log(
    '1. Go to GitHub Settings → Developer settings → Personal access tokens'
  );
  console.log('2. Generate a new token with "repo" and "read:user" scopes');
  console.log('3. Copy the token below\n');

  const githubToken = await question('GitHub Personal Access Token: ');
  const githubUsername = await question('GitHub Username: ');

  console.log('\n📋 Slack Configuration:');
  console.log('1. Create a Slack App at https://api.slack.com/apps');
  console.log('2. Add "chat:write" and "chat:write.public" OAuth scopes');
  console.log('3. Install the app to your workspace');
  console.log('4. Copy the Bot User OAuth Token (starts with xoxb-)');
  console.log(
    '5. Get your channel ID (right-click channel → Copy link → extract ID)\n'
  );

  const slackToken = await question('Slack Bot Token (xoxb-...): ');
  const slackChannel = await question('Slack Channel ID (C... or G...): ');

  console.log('\n📋 Claude AI Configuration (Optional):');
  console.log('1. Get your Claude API key from https://console.anthropic.com/');
  console.log('2. This enables AI-powered executive summaries\n');

  const claudeApiKey = await question(
    'Claude API Key (optional, press Enter to skip): '
  );

  console.log('\n📋 Optional Configuration:');
  const defaultWeeks =
    (await question('Default weeks for merged PRs (1-4, default: 2): ')) || '2';
  const maxWeeks =
    (await question('Maximum weeks allowed (default: 4): ')) || '4';

  // Create .env content
  const envContent = `# GitHub Configuration
GITHUB_TOKEN=${githubToken}
GITHUB_USERNAME=${githubUsername}

# Slack Configuration
SLACK_BOT_TOKEN=${slackToken}
SLACK_CHANNEL_ID=${slackChannel}

# Claude AI Configuration
CLAUDE_API_KEY=${claudeApiKey || ''}

# Configuration
DEFAULT_WEEKS_BACK=${defaultWeeks}
MAX_WEEKS_BACK=${maxWeeks}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env file!');
    console.log('\nNext steps:');
    console.log('1. Test the GitHub integration: npm test');
    console.log('2. Test the full integration: npm start open-prs');
    console.log('3. Check the README.md for more usage examples');
  } catch (error) {
    console.error('❌ Error saving configuration:', error.message);
  }

  rl.close();
}

// Only run if this file is executed directly
if (require.main === module) {
  setup().catch(console.error);
}
