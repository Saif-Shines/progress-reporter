# Weekly Updates - GitHub PR Tracker

A Node.js script that connects to GitHub and Slack to track your Pull Requests and send automated updates.

## Features

### Scenario #1: Open PRs Tracker

- Fetches all open PRs you've created across your repositories
- Identifies reviewers and requested reviewers
- Sends a formatted Slack message with PR details
- Shows who is waiting to review your code

### Scenario #2: Merged PRs Summary

- Tracks merged PRs from the last 2-4 weeks (configurable)
- Provides a weekly summary with statistics
- Shows additions, deletions, and files changed
- Sends a comprehensive report to Slack

### Scenario #3: AI-Powered Executive Summary 🆕

- Uses Claude AI to generate professional executive summaries
- Analyzes both open and merged PRs
- Creates business-friendly status reports
- Sends concise, actionable insights to Slack

## Prerequisites

- Node.js (v14 or higher)
- GitHub Personal Access Token
- Slack Bot Token
- Slack Channel ID
- Claude API Key (optional, for AI-powered summaries)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Interactive Setup

```bash
npm run setup
```

This will guide you through the configuration process and create your `.env` file automatically.

### 3. Test the Integration

```bash
npm test
```

This will test your GitHub integration without sending any Slack messages.

## Manual Setup

If you prefer to configure manually, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=your-slack-channel-id

# Configuration
DEFAULT_WEEKS_BACK=2
MAX_WEEKS_BACK=4
```

### 3. GitHub Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to user profile)
3. Copy the token to your `.env` file

### 4. Slack Setup

1. Create a new Slack App at https://api.slack.com/apps
2. Add the following OAuth scopes:
   - `chat:write` (Send messages as the app)
   - `chat:write.public` (Send messages to public channels)
3. Install the app to your workspace
4. Copy the Bot User OAuth Token to your `.env` file
5. Get your channel ID (right-click channel → Copy link → extract the ID)

## Usage

### Check Open PRs

```bash
npm start open-prs
```

### Check Merged PRs (Last 2 weeks)

```bash
npm start merged-prs
```

### Check Merged PRs (Custom weeks)

```bash
npm start merged-prs --weeks 3
```

### Run Both Checks

```bash
npm start all
```

### Run Both Checks with Custom Weeks

```bash
npm start all --weeks 4
```

### Generate AI-Powered Executive Summary

```bash
npm start executive-summary
```

### Generate Executive Summary (Custom weeks)

```bash
npm start executive-summary --weeks 3
```

## Command Line Options

- `open-prs`: Check for open PRs waiting for reviews
- `merged-prs`: Check merged PRs from recent weeks
  - `-w, --weeks <number>`: Number of weeks to look back (1-4, default: 2)
- `all`: Run both open PRs and merged PRs checks
  - `-w, --weeks <number>`: Number of weeks for merged PRs (1-4, default: 2)
- `executive-summary`: Generate AI-powered executive summary
  - `-w, --weeks <number>`: Number of weeks for merged PRs (1-4, default: 2)

## Example Output

### Open PRs Message

```
🔍 Open PRs Waiting for Reviews (2)

Add user authentication feature
Repo: myorg/myapp (#123)
Reviewers: john.doe, jane.smith
Requested Reviewers: alice.brown

This PR adds OAuth2 authentication with Google and GitHub...

---

Fix navigation bug in mobile view
Repo: myorg/myapp (#124)
Reviewers: No reviewers assigned yet

Fixes the navigation menu not working properly on mobile devices...
```

### Merged PRs Message

```
📊 Weekly Summary - Last 2 Week(s)
3 PR(s) merged

---

Implement dark mode toggle
Repo: myorg/myapp (#120) • Merged: Dec 15, 2024

Adds a dark mode toggle in the settings panel with theme persistence...

---

Update API documentation
Repo: myorg/myapp (#121) • Merged: Dec 12, 2024

Updates the API documentation with new endpoints and examples...
```

### Executive Summary Message

```
📊 Executive Summary
Status Overview - Last 2 Week(s)
• Open PRs: 2
• Merged PRs: 3

---

Over the past two weeks, significant progress has been made on the authentication system and mobile navigation improvements. Three pull requests were successfully merged, including the implementation of OAuth2 authentication and mobile navigation bug fixes.

Currently, there are two open pull requests awaiting review: a user authentication feature that has been assigned to john.doe and jane.smith, and a mobile navigation fix that still needs reviewer assignment. The authentication feature appears to be a substantial addition requiring careful review.

**Action Items:**
- The mobile navigation PR needs reviewer assignment to move forward
- Consider prioritizing the authentication feature review given its complexity
```

## Configuration

### Environment Variables

| Variable             | Description                               | Required |
| -------------------- | ----------------------------------------- | -------- |
| `GITHUB_TOKEN`       | GitHub Personal Access Token              | Yes      |
| `GITHUB_USERNAME`    | Your GitHub username                      | Yes      |
| `SLACK_BOT_TOKEN`    | Slack Bot User OAuth Token                | Yes      |
| `SLACK_CHANNEL_ID`   | Slack Channel ID to post messages         | Yes      |
| `CLAUDE_API_KEY`     | Claude API Key for AI summaries           | No       |
| `DEFAULT_WEEKS_BACK` | Default weeks for merged PRs (default: 2) | No       |
| `MAX_WEEKS_BACK`     | Maximum weeks allowed (default: 4)        | No       |

## Troubleshooting

### Common Issues

1. **GitHub API Rate Limit**: The script respects GitHub's rate limits. If you hit limits, wait a few minutes and try again.

2. **Slack Permission Error**: Ensure your Slack bot has the correct permissions and is added to the target channel.

3. **Repository Access**: Make sure your GitHub token has access to all repositories you want to track.

4. **Channel ID Format**: Slack channel IDs should start with `C` (public channels) or `G` (private channels).

5. **Claude API Error**: If you get Claude API errors, make sure your API key is valid and has sufficient credits.

### Debug Mode

To see more detailed logs, you can run the script with Node.js debug flags:

```bash
DEBUG=* npm start open-prs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
