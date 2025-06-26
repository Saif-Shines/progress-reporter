#!/usr/bin/env node

require('dotenv').config();
const { getOpenPRs, getMergedPRs } = require('./src/github-slack-integration');

async function testGitHubIntegration() {
  console.log('🧪 Testing GitHub Integration...\n');

  try {
    // Test open PRs
    console.log('📋 Fetching open PRs...');
    const openPRs = await getOpenPRs();
    console.log(`Found ${openPRs.length} open PR(s)`);

    if (openPRs.length > 0) {
      console.log('\nOpen PRs:');
      openPRs.forEach((pr, index) => {
        console.log(`${index + 1}. ${pr.title}`);
        console.log(`   Repo: ${pr.repo} (#${pr.number})`);
        console.log(`   Reviewers: ${pr.reviewers.join(', ') || 'None'}`);
        console.log(
          `   Requested: ${pr.requestedReviewers.join(', ') || 'None'}`
        );
        console.log('');
      });
    }

    // Test merged PRs
    console.log('📊 Fetching merged PRs from last 2 weeks...');
    const mergedPRs = await getMergedPRs(2);
    console.log(`Found ${mergedPRs.length} merged PR(s) in last 2 weeks`);

    if (mergedPRs.length > 0) {
      console.log('\nMerged PRs:');
      mergedPRs.forEach((pr, index) => {
        console.log(`${index + 1}. ${pr.title}`);
        console.log(`   Repo: ${pr.repo} (#${pr.number})`);
        console.log(`   Merged: ${pr.merged_at}`);
        console.log(
          `   Changes: +${pr.additions} -${pr.deletions} (${pr.changed_files} files)`
        );
        console.log('');
      });
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
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testGitHubIntegration();
}
