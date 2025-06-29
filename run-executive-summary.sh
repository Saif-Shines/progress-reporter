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