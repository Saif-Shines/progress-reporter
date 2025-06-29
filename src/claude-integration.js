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

    const prompt = `You are an AI assistant helping to create executive summaries of GitHub Pull Request status updates.

Please analyze the following GitHub data and create a concise, professional executive summary that would be suitable for a business context.

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
  Description: ${pr.description.substring(0, 150)}${
      pr.description.length > 150 ? '...' : ''
    }`
  )
  .join('\n')}

**Merged PRs Details:**
${summaryData.mergedPRs
  .map(
    (pr) => `- ${pr.title} (${pr.repo} #${pr.number}) - Merged: ${pr.merged_at}
  Description: ${pr.description.substring(0, 150)}${
      pr.description.length > 150 ? '...' : ''
    }`
  )
  .join('\n')}

**Instructions:**
1. Create a casual executive summary (1 paragraph)
2. List the data you got in bullet points. 
3. Use bullet points for easy scannability
4. Leave links to the PRs for easy access (don't pollute)

**Format the response as a clean executive summary suitable for Slack.**`;

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
