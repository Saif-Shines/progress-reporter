# Weekly Updates - GitHub PR Tracker

A simple Node.js tool that connects to GitHub and Slack to track your Pull Requests and send automated updates.

## What this tool does

### Track open PRs waiting for reviews

- Finds all your open PRs across repositories
- Shows who has reviewed and who still needs to review
- Sends a formatted message to Slack with PR details
- Helps you see who is waiting to review your code

### Track merged PRs from recent weeks

- Shows PRs merged in the last 1-4 weeks (you choose)
- Provides a simple weekly summary
- Sends a clean report to Slack

### Generate AI-powered summaries

- Uses Claude AI to create simple, actionable summaries
- Focuses on open PRs that need attention
- Creates easy-to-scan bullet points with direct PR links

## What you need to get started

- Node.js (version 14 or higher)
- GitHub Personal Access Token
- Slack Bot Token
- Slack Channel ID
- Claude API Key (optional, for AI summaries)

## Quick setup (5 minutes)

### 1. Install the tool

```bash
npm install
```

### 2. Run the setup wizard

```bash
npm run setup
```

This will guide you through all the configuration and create your settings file automatically.

### 3. Test your setup

```bash
npm test
```

This tests your GitHub connection without sending any Slack messages.

## Manual setup (if you prefer)

### 1. Install dependencies

```bash
npm install
```

### 2. Create your settings file

```bash
cp env.example .env
```

### 3. Add your configuration

Edit `.env` with your actual values:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=your-slack-channel-id

# Claude AI Configuration (optional)
CLAUDE_API_KEY=your_claude_api_key

# Configuration
DEFAULT_WEEKS_BACK=1
MAX_WEEKS_BACK=4
```

### 4. Get your GitHub token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to user profile)
3. Copy the token to your `.env` file

### 5. Set up Slack

1. Create a new Slack App at https://api.slack.com/apps
2. Add these permissions:
   - `chat:write` (Send messages as the app)
   - `chat:write.public` (Send messages to public channels)
3. Install the app to your workspace
4. Copy the Bot User OAuth Token to your `.env` file
5. Get your channel ID (right-click channel → Copy link → extract the ID)

## How to use the tool

### Check open PRs waiting for reviews

```bash
npm start open-prs
```

### Check merged PRs from last week

```bash
npm start merged-prs
```

### Check merged PRs from custom time period

```bash
npm start merged-prs --weeks 3
```

### Run both checks at once

```bash
npm start all
```

### Generate AI summary (last week only)

```bash
npm start executive-summary
```

### Generate AI summary for custom time period

```bash
npm start executive-summary --weeks 3
```

## Available commands

| Command             | What it does                            | Options                                  |
| ------------------- | --------------------------------------- | ---------------------------------------- |
| `open-prs`          | Check open PRs waiting for reviews      | None                                     |
| `merged-prs`        | Check merged PRs from recent weeks      | `-w, --weeks <number>` (1-4, default: 1) |
| `all`               | Run both open PRs and merged PRs checks | `-w, --weeks <number>` (1-4, default: 1) |
| `executive-summary` | Generate AI-powered summary             | `-w, --weeks <number>` (1-4, default: 1) |

## Example outputs

### Open PRs message

```
🔍 Open PRs Waiting for Reviews (2)

Add user authentication feature
Repo: myorg/myapp (#123)
Requested Reviewers: alice.brown, bob.wilson

This PR adds OAuth2 authentication with Google and GitHub...

---

Fix navigation bug in mobile view
Repo: myorg/myapp (#124)

Fixes the navigation menu not working properly on mobile devices...
```

### Merged PRs message

```
📊 Weekly Summary - Last 1 Week(s)
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

### AI Executive Summary

```
Here are open PR's last week. It's waiting on following reviews:

• FSA related fast follow updates, review it here <link to PR>
• Add pre-commit hook for targeted Prettier formatting, review it here <link to PR>
• Expose delete membership API, review it here <link to PR>
```

## Configuration settings

| Setting              | Description                                 | Required |
| -------------------- | ------------------------------------------- | -------- |
| `GITHUB_TOKEN`       | Your GitHub Personal Access Token           | Yes      |
| `GITHUB_USERNAME`    | Your GitHub username                        | Yes      |
| `SLACK_BOT_TOKEN`    | Your Slack Bot User OAuth Token             | Yes      |
| `SLACK_CHANNEL_ID`   | The Slack channel where messages are posted | Yes      |
| `CLAUDE_API_KEY`     | Your Claude API Key for AI summaries        | No       |
| `DEFAULT_WEEKS_BACK` | Default weeks for merged PRs (default: 1)   | No       |
| `MAX_WEEKS_BACK`     | Maximum weeks allowed (default: 4)          | No       |

## Common problems and solutions

### GitHub API rate limit

The tool respects GitHub's rate limits. If you hit limits, wait a few minutes and try again.

### Slack permission error

Make sure your Slack bot has the correct permissions and is added to the target channel.

### Repository access error

Ensure your GitHub token has access to all repositories you want to track.

### Channel ID format error

Slack channel IDs should start with `C` (public channels) or `G` (private channels).

### Claude API error

If you get Claude API errors, make sure your API key is valid and has sufficient credits.

### Debug mode

To see detailed logs, run:

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
