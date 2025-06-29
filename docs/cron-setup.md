# Cron Job Setup for Weekly Updates

This document explains how to set up, manage, and remove cron jobs for the weekly-updates project.

## Overview

The cron job will automatically run `npm start executive-summary` every week at 8 AM IST (2:30 AM UTC) to generate and send executive summaries to Slack.

## Prerequisites

1. Ensure your project is properly configured with environment variables
2. Make sure you have the necessary permissions to create cron jobs
3. Verify that `npm start executive-summary` works manually

## Setup Instructions

### Step 1: Create the Shell Script

Create a shell script that will be executed by cron:

```bash
#!/bin/bash

# Navigate to your project directory
cd /Users/saif/Projects/free-time-projects/weekly-updates

# Load environment variables (if using .env file)
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the executive summary command
npm start executive-summary

# Log the execution
echo "$(date): Executive summary script executed" >> /tmp/executive-summary.log
```

Save this as `run-executive-summary.sh` in your project root and make it executable:

```bash
chmod +x /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

### Step 2: Add the Cron Job

Open your crontab for editing:

```bash
crontab -e
```

Add this line to run the script every Monday at 8 AM IST:

```bash
30 2 * * 1 /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

**Cron Format Explanation:**

- `30` = Minute (30)
- `2` = Hour (2 AM UTC = 8 AM IST)
- `*` = Day of month (any)
- `*` = Month (any)
- `1` = Day of week (Monday)

### Step 3: Verify the Cron Job

List your current cron jobs:

```bash
crontab -l
```

You should see your newly added job in the list.

## Managing Cron Jobs

### View Current Cron Jobs

```bash
crontab -l
```

### Edit Cron Jobs

```bash
crontab -e
```

This opens your crontab in the default editor (usually vim or nano).

### Remove All Cron Jobs

```bash
crontab -r
```

**Warning:** This removes ALL cron jobs for your user, not just the weekly updates job.

### Remove Specific Cron Job

1. Open crontab for editing: `crontab -e`
2. Delete the specific line you want to remove
3. Save and exit

## Troubleshooting

### Check if Cron is Running

```bash
sudo launchctl list | grep cron
```

### View Cron Logs

```bash
tail -f /var/log/cron.log
```

### Test the Script Manually

```bash
/Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

### Check Execution Logs

```bash
tail -f /tmp/executive-summary.log
```

## Common Issues

### Issue: Script doesn't run

**Solution:** Check file permissions and ensure the script is executable:

```bash
chmod +x /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

### Issue: Environment variables not available

**Solution:** Make sure your `.env` file exists and contains the necessary variables.

### Issue: Wrong timezone

**Solution:** Cron uses UTC time. 8 AM IST = 2:30 AM UTC.

## Alternative Schedule Options

### Run Every Day at 8 AM IST

```bash
30 2 * * * /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

### Run Every Friday at 8 AM IST

```bash
30 2 * * 5 /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

### Run Every Monday and Friday at 8 AM IST

```bash
30 2 * * 1,5 /Users/saif/Projects/free-time-projects/weekly-updates/run-executive-summary.sh
```

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- The script logs execution to `/tmp/executive-summary.log` for debugging
- Consider using absolute paths in the cron job to avoid path-related issues

## Maintenance

- Regularly check the execution logs to ensure the job is running correctly
- Update the cron job if you move the project to a different location
- Test the script manually after any significant changes to the project
