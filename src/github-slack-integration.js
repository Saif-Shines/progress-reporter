const { Octokit } = require('@octokit/rest');
const { WebClient } = require('@slack/web-api');
const moment = require('moment');
const {
  generateExecutiveSummary,
  createExecutiveSummaryMessage,
} = require('./claude-integration');

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Get all repositories for the authenticated user
 */
async function getUserRepositories() {
  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    return repos;
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    throw error;
  }
}

/**
 * Get open PRs created by the user across all repositories
 */
async function getOpenPRs() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const repos = await getUserRepositories();
    const openPRs = [];

    for (const repo of repos) {
      try {
        const { data: prs } = await octokit.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: 'open',
          per_page: 100,
        });

        // Filter PRs created by the user
        const userPRs = prs.filter((pr) => pr.user.login === username);

        for (const pr of userPRs) {
          // Get reviewers for each PR
          const { data: reviews } = await octokit.pulls.listReviews({
            owner: repo.owner.login,
            repo: repo.name,
            pull_number: pr.number,
          });

          const reviewers = reviews
            .filter(
              (review) =>
                review.state === 'APPROVED' ||
                review.state === 'CHANGES_REQUESTED'
            )
            .map((review) => review.user.login);

          openPRs.push({
            title: pr.title,
            description: pr.body || 'No description provided',
            url: pr.html_url,
            repo: repo.full_name,
            number: pr.number,
            reviewers: reviewers,
            requestedReviewers:
              pr.requested_reviewers?.map((r) => r.login) || [],
            created_at: pr.created_at,
          });
        }
      } catch (error) {
        console.warn(
          `Warning: Could not fetch PRs for ${repo.full_name}:`,
          error.message
        );
      }
    }

    return openPRs;
  } catch (error) {
    console.error('Error fetching open PRs:', error.message);
    throw error;
  }
}

/**
 * Get merged PRs from the last N weeks
 */
async function getMergedPRs(weeksBack) {
  try {
    const username = process.env.GITHUB_USERNAME;
    const repos = await getUserRepositories();
    const mergedPRs = [];
    const cutoffDate = moment().subtract(weeksBack, 'weeks').toISOString();

    for (const repo of repos) {
      try {
        const { data: prs } = await octokit.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: 'closed',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        });

        // Filter merged PRs created by the user within the time period
        const userMergedPRs = prs.filter(
          (pr) =>
            pr.user.login === username &&
            pr.merged_at &&
            moment(pr.merged_at).isAfter(cutoffDate)
        );

        for (const pr of userMergedPRs) {
          mergedPRs.push({
            title: pr.title,
            description: pr.body || 'No description provided',
            url: pr.html_url,
            repo: repo.full_name,
            number: pr.number,
            merged_at: pr.merged_at,
          });
        }
      } catch (error) {
        console.warn(
          `Warning: Could not fetch merged PRs for ${repo.full_name}:`,
          error.message
        );
      }
    }

    return mergedPRs.sort(
      (a, b) => moment(b.merged_at).valueOf() - moment(a.merged_at).valueOf()
    );
  } catch (error) {
    console.error('Error fetching merged PRs:', error.message);
    throw error;
  }
}

/**
 * Create Slack message for open PRs
 */
function createOpenPRsMessage(openPRs) {
  if (openPRs.length === 0) {
    return {
      text: '🎉 *Great news!* You have no open PRs waiting for reviews.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🎉 *Great news!* You have no open PRs waiting for reviews.',
          },
        },
      ],
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🔍 Open PRs Waiting for Reviews (${openPRs.length})`,
        emoji: true,
      },
    },
    {
      type: 'divider',
    },
  ];

  for (const pr of openPRs) {
    const reviewersText =
      pr.reviewers.length > 0
        ? `*Reviewers:* ${pr.reviewers.join(', ')}\n`
        : '';

    const requestedReviewersText =
      pr.requestedReviewers.length > 0
        ? `*Requested Reviewers:* ${pr.requestedReviewers.join(', ')}\n`
        : '';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${pr.url}|${pr.title}>*\n*Repo:* <https://github.com/${
          pr.repo
        }/pull/${pr.number}|${pr.repo}> (#${
          pr.number
        })\n${reviewersText}${requestedReviewersText}\n${pr.description.substring(
          0,
          200
        )}${pr.description.length > 200 ? '...' : ''}`,
      },
    });

    if (openPRs.indexOf(pr) < openPRs.length - 1) {
      blocks.push({
        type: 'divider',
      });
    }
  }

  return {
    text: `You have ${openPRs.length} open PR(s) waiting for reviews`,
    blocks: blocks,
  };
}

/**
 * Create Slack message for merged PRs
 */
function createMergedPRsMessage(mergedPRs, weeksBack) {
  if (mergedPRs.length === 0) {
    return {
      text: `No PRs were merged in the last ${weeksBack} week(s).`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📊 *Weekly Summary*\nNo PRs were merged in the last ${weeksBack} week(s).`,
          },
        },
      ],
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 Weekly Summary - Last ${weeksBack} Week(s)`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${mergedPRs.length} PR(s) merged*`,
      },
    },
    {
      type: 'divider',
    },
  ];

  for (const pr of mergedPRs) {
    const mergedDate = moment(pr.merged_at).format('MMM DD, YYYY');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${pr.url}|${pr.title}>*\n*Repo:* <https://github.com/${
          pr.repo
        }/pull/${pr.number}|${pr.repo}> (#${
          pr.number
        }) • *Merged:* ${mergedDate}\n\n${pr.description.substring(0, 200)}${
          pr.description.length > 200 ? '...' : ''
        }`,
      },
    });

    if (mergedPRs.indexOf(pr) < mergedPRs.length - 1) {
      blocks.push({
        type: 'divider',
      });
    }
  }

  return {
    text: `${mergedPRs.length} PR(s) were merged in the last ${weeksBack} week(s)`,
    blocks: blocks,
  };
}

/**
 * Send message to Slack
 */
async function sendSlackMessage(message) {
  try {
    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      ...message,
    });

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    console.log('✅ Message sent to Slack successfully');
    return result;
  } catch (error) {
    console.error('Error sending message to Slack:', error.message);
    throw error;
  }
}

/**
 * Check open PRs and send to Slack (Scenario #1)
 */
async function checkOpenPRs() {
  const openPRs = await getOpenPRs();
  const message = createOpenPRsMessage(openPRs);
  await sendSlackMessage(message);
}

/**
 * Check merged PRs and send to Slack (Scenario #2)
 */
async function checkMergedPRs(weeksBack = 2) {
  const mergedPRs = await getMergedPRs(weeksBack);
  const message = createMergedPRsMessage(mergedPRs, weeksBack);
  await sendSlackMessage(message);
}

/**
 * Generate and send executive summary to Slack
 */
async function generateAndSendExecutiveSummary(weeksBack = 2) {
  try {
    console.log('🤖 Generating executive summary with Claude AI...');

    const openPRs = await getOpenPRs();
    const mergedPRs = await getMergedPRs(weeksBack);

    const summary = await generateExecutiveSummary(
      openPRs,
      mergedPRs,
      weeksBack
    );
    const message = createExecutiveSummaryMessage(
      summary,
      openPRs,
      mergedPRs,
      weeksBack
    );

    await sendSlackMessage(message);
    console.log('✅ Executive summary sent to Slack successfully!');
  } catch (error) {
    console.error('❌ Error generating executive summary:', error.message);
    throw error;
  }
}

module.exports = {
  checkOpenPRs,
  checkMergedPRs,
  generateAndSendExecutiveSummary,
  getOpenPRs,
  getMergedPRs,
  sendSlackMessage,
};
