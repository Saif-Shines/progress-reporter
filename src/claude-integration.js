const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * Generate an executive summary using Claude AI
 */
async function generateExecutiveSummary(openPRs, mergedPRs, weeksBack) {
  try {
    // Prepare the data for Claude
    const summaryData = {
      openPRs: openPRs.map((pr) => ({
        title: pr.title,
        repo: pr.repo,
        number: pr.number,
        description: pr.description,
        reviewers: pr.reviewers,
        requestedReviewers: pr.requestedReviewers,
        created_at: pr.created_at,
      })),
      mergedPRs: mergedPRs.map((pr) => ({
        title: pr.title,
        repo: pr.repo,
        number: pr.number,
        description: pr.description,
        merged_at: pr.merged_at,
      })),
      weeksBack: weeksBack,
    };

    const prompt = `You are an AI assistant helping to create simple, concise summaries of GitHub Pull Request status updates.

Please analyze the following GitHub data and create a very brief summary focusing only on open PRs from the last week.

**Data to analyze:**
- Open PRs waiting for review: ${summaryData.openPRs.length}
- Merged PRs in the last ${summaryData.weeksBack} weeks: ${
      summaryData.mergedPRs.length
    }

**Open PRs Details:**
${summaryData.openPRs
  .map(
    (pr) => `- ${pr.title} (${pr.repo} #${pr.number})
  ${pr.reviewers.length > 0 ? `Reviewers: ${pr.reviewers.join(', ')}` : ''}
  ${
    pr.requestedReviewers.length > 0
      ? `Requested: ${pr.requestedReviewers.join(', ')}`
      : ''
  }
  PR Link: <https://github.com/${pr.repo}/pull/${pr.number}|${pr.title}>`
  )
  .join('\n')}

**Instructions:**
1. Create a very simple, casual summary (1-2 sentences max)
2. Focus ONLY on open PRs that are waiting for reviews
3. Use this exact format: "Here are open PR's last week. It's waiting on following reviews:"
4. List each open PR with a brief title, reviewer information, and include the PR link
5. For each PR, show who has reviewed and who still needs to review
6. Use Slack's hyperlink format for all PR links: <url|text>
7. Do NOT use [text](url) format. Only use <url|text> for links.
8. Keep it extremely concise and scannable
9. Use bullet points for easy reading

**Format the response as a simple list with PR links and reviewer details, using Slack's <url|text> format for all links.**`;

    const response = await claude.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error generating executive summary:', error.message);
    throw new Error(`Failed to generate executive summary: ${error.message}`);
  }
}

/**
 * Create a Slack message with the executive summary
 */
function createExecutiveSummaryMessage(summary, openPRs, mergedPRs, weeksBack) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Executive Summary',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Status Overview - Last ${weeksBack} Week(s)*\n• Open PRs: ${openPRs.length}\n• Merged PRs: ${mergedPRs.length}`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: summary,
      },
    },
  ];

  return {
    text: `Executive Summary: ${openPRs.length} open PRs, ${mergedPRs.length} merged PRs in last ${weeksBack} weeks`,
    blocks: blocks,
  };
}

module.exports = {
  generateExecutiveSummary,
  createExecutiveSummaryMessage,
};
