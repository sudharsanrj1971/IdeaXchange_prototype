#!/bin/bash
# MongoDB Backup Script
BACKUP_DIR="./backups"
MONGO_URI=${MONGODB_URI:-mongodb://localhost:27017/ideaxchange}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$TIMESTAMP"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_DIR/$TIMESTAMP"
  # Keep only last 7 days of backups
  find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -mtime +7 -type d -exec rm -rf {} +
else
  echo "Backup failed!" >&2
  exit 1
fi
