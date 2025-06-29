#!/usr/bin/env node

require('dotenv').config();
const readline = require('readline');
const { getOpenPRs, getMergedPRs } = require('./src/github-slack-integration');
const { generateExecutiveSummary } = require('./src/claude-integration');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testGitHubIntegration() {
  console.log('🧪 Testing GitHub Integration...\n');

  try {
    // Test open PRs
    console.log('📋 Fetching open PRs...');
    const openPRs = await getOpenPRs();
    console.log(`Found ${openPRs.length} open PR(s)`);

    // Test merged PRs
    console.log('📊 Fetching merged PRs from last 1 week...');
    const mergedPRs = await getMergedPRs(1);
    console.log(`Found ${mergedPRs.length} merged PR(s) in last 1 week`);

    // Ask user for output preference
    console.log('\n📝 Choose your output format:');
    console.log('1. Regular detailed output (current format)');
    console.log('2. Claude AI executive summary');

    const choice = await question('\nEnter your choice (1 or 2): ');

    if (choice === '2') {
      // Generate Claude summary
      console.log('\n🤖 Generating Claude AI executive summary...');
      try {
        const summary = await generateExecutiveSummary(openPRs, mergedPRs, 1);
        console.log('\n📊 EXECUTIVE SUMMARY:');
        console.log('='.repeat(50));
        console.log(summary);
        console.log('='.repeat(50));
      } catch (error) {
        console.error('❌ Error generating Claude summary:', error.message);
        console.log('\nFalling back to regular output...\n');
        displayRegularOutput(openPRs, mergedPRs);
      }
    } else {
      // Display regular output
      displayRegularOutput(openPRs, mergedPRs);
    }

    console.log('✅ GitHub integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nMake sure you have:');
    console.error(
      '1. Set up your .env file with GITHUB_TOKEN and GITHUB_USERNAME'
    );
    console.error('2. Your GitHub token has the correct permissions');
    console.error('3. Your GitHub username is correct');
    if (choice === '2') {
      console.error(
        '4. For Claude summary: Set CLAUDE_API_KEY in your .env file'
      );
    }
  } finally {
    rl.close();
  }
}

function displayRegularOutput(openPRs, mergedPRs) {
  if (openPRs.length > 0) {
    console.log('\nOpen PRs:');
    openPRs.forEach((pr, index) => {
      console.log(`${index + 1}. ${pr.title}`);
      console.log(`   Repo: https://github.com/${pr.repo}/pull/${pr.number}`);
      if (pr.reviewers.length > 0) {
        console.log(`   Reviewers: ${pr.reviewers.join(', ')}`);
      }
      if (pr.requestedReviewers.length > 0) {
        console.log(`   Requested: ${pr.requestedReviewers.join(', ')}`);
      }
      console.log('');
    });
  }

  if (mergedPRs.length > 0) {
    console.log('\nMerged PRs:');
    mergedPRs.forEach((pr, index) => {
      console.log(`${index + 1}. ${pr.title}`);
      console.log(`   Repo: https://github.com/${pr.repo}/pull/${pr.number}`);
      console.log(`   Merged: ${pr.merged_at}`);
      console.log('');
    });
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testGitHubIntegration();
}
