#!/bin/bash

# This script is designed to be run as a cron job to automatically
# archive expired hiring goals and create new ones as needed.
#
# Example cron entry to run monthly on the 1st at 2 AM:
# 0 2 1 * * /path/to/backend/src/scripts/schedule-archive-hiring-goals.sh
#
# Or annually on January 1st:
# 0 2 1 1 * /path/to/backend/src/scripts/schedule-archive-hiring-goals.sh

# Navigate to the backend directory (adjust paths as needed)
cd "$(dirname "$0")/../.." || exit

# Log file for debugging
LOG_FILE="./logs/archive-hiring-goals-$(date '+%Y-%m-%d').log"
SCRIPT_PATH="./src/scripts/archive-hiring-goals.ts"

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Log start time
echo "Starting hiring goals archival process at $(date)" > "$LOG_FILE"

# Run the archive script
echo "Executing archive script..." >> "$LOG_FILE"
npx ts-node "$SCRIPT_PATH" >> "$LOG_FILE" 2>&1

# Check exit status
if [ $? -eq 0 ]; then
  echo "Archive process completed successfully at $(date)" >> "$LOG_FILE"
else
  echo "Archive process failed at $(date)" >> "$LOG_FILE"
  # Optionally send email notification on failure
  # mail -s "Hiring Goals Archive Failed" admin@example.com < "$LOG_FILE"
fi

# Make the log readable
chmod 644 "$LOG_FILE"

exit 0 