#!/bin/bash

# Tarodan Backup Script
# This script creates backups of the database and uploaded files

set -e

BACKUP_DIR="/var/tarodan/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo "🔄 Starting Tarodan Backup..."

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Database backup
echo "📦 Backing up PostgreSQL database..."
docker exec tarodan-postgres pg_dump -U postgres tarodan | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# MinIO backup (uploads)
echo "📁 Backing up uploaded files..."
docker exec tarodan-minio mc mirror /data "$BACKUP_DIR/minio_backup_$DATE" --quiet

# Create combined archive
echo "📦 Creating combined archive..."
tar -czf "$BACKUP_DIR/tarodan_backup_$DATE.tar.gz" \
    -C "$BACKUP_DIR" \
    "db_backup_$DATE.sql.gz" \
    "minio_backup_$DATE"

# Cleanup temporary files
rm -f "$BACKUP_DIR/db_backup_$DATE.sql.gz"
rm -rf "$BACKUP_DIR/minio_backup_$DATE"

# Remove old backups
echo "🗑️ Removing backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "tarodan_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo ""
echo "✅ Backup completed: $BACKUP_DIR/tarodan_backup_$DATE.tar.gz"
echo ""

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/tarodan_backup_$DATE.tar.gz" | cut -f1)
echo "📊 Backup size: $BACKUP_SIZE"

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh $BACKUP_DIR/tarodan_backup_*.tar.gz | tail -5
