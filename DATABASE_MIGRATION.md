# Database Migration Guide

This guide explains how to migrate News1 from file-based storage to PostgreSQL database.

## Overview

The News1 application has been upgraded from markdown file-based storage to PostgreSQL database storage with the following benefits:

- ✅ **Scalable**: Handle thousands of articles efficiently
- ✅ **Search**: Advanced search capabilities with filters
- ✅ **Version History**: Track all changes to articles
- ✅ **Draft/Publish**: Workflow for content management
- ✅ **Analytics**: Track article views and engagement
- ✅ **Multi-user**: Support for multiple authors and roles
- ✅ **Backup**: Automatic markdown export for backup

## Database Schema

The database includes the following tables:

1. **articles** - Main article storage with status (draft/published/scheduled/archived)
2. **users** - User accounts with roles
3. **roles** - Role definitions with permissions (admin, editor, author)
4. **article_versions** - Version history for articles
5. **categories** - Article categories (optional, can use tags instead)

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database (local or hosted)
2. **DATABASE_URL**: Environment variable pointing to your database

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb news1

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@localhost:5432/news1"
```

### Option 2: Hosted Database (Recommended)

Use a hosted PostgreSQL service like:
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

Get your DATABASE_URL from the service and add it to `.env`:

```env
DATABASE_URL=postgresql://username:password@host:5432/dbname
```

## Migration Steps

### Step 1: Set up Database URL

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set your DATABASE_URL:

```env
DATABASE_URL=postgresql://your-connection-string-here
```

### Step 2: Push Database Schema

This creates all tables, indexes, and relationships:

```bash
npm run db:push
```

You should see:
```
✓ Pushing schema...
✓ Done!
```

### Step 3: Import Existing Markdown Articles

This script reads all markdown files from `content/` directory and imports them to the database:

```bash
npm run db:seed
```

You should see output like:
```
🚀 Starting markdown to database migration...

👤 Creating default admin user...
  ✅ Created admin role
  ✅ Created editor role
  ✅ Created author role
  ✅ Created admin user (username: admin)

📖 Reading markdown files from: /path/to/content
📁 Found 12 channels: ambal, beritaangin, cakranews, ...
  📄 Channel "cakranews": 5 articles
  📄 Channel "mjbnews": 3 articles
  ...

📥 Importing 45 articles to database...
  ✅ Imported: cakranews/launch-announcement
  ✅ Imported: mjbnews/about-mjb
  ...

📊 Import Summary:
  ✅ Imported: 45
  ⏭️  Skipped: 0
  ❌ Errors: 0

✅ Migration completed successfully!
```

### Step 4: Verify Migration

Test the application:

```bash
npm run dev
```

Visit:
- `http://localhost:5000` - Public site (should show all articles)
- `http://localhost:5000/admin` - Admin panel (login with admin/admin123)

## Default Admin Credentials

After migration, you'll have a default admin user:

```
Username: admin
Password: admin123 (or value from ADMIN_PASSWORD env var)
```

**⚠️ IMPORTANT**: Change the password immediately in production!

Update `.env`:
```env
ADMIN_USERNAME=yourusername
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-jwt-secret-min-128-chars
```

## Database Management Scripts

```bash
# Generate new migration files (after schema changes)
npm run db:generate

# Push schema to database (create/update tables)
npm run db:push

# Import markdown files to database
npm run db:seed

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

## Backup Strategy

The system maintains **dual storage**:

1. **Primary**: PostgreSQL database (source of truth)
2. **Backup**: Markdown files (auto-exported on create/update)

### Manual Backup

To export all articles to markdown:

```typescript
// Coming soon: npm run db:export-markdown
```

### Database Backup

Use PostgreSQL native backup tools:

```bash
# Backup database
pg_dump -U username dbname > backup.sql

# Restore database
psql -U username dbname < backup.sql
```

## Features Enabled by Database

### 1. Article Status Workflow

Articles can now have different statuses:
- `draft` - Work in progress
- `published` - Live on site
- `scheduled` - Publish at specific time
- `archived` - Removed from site

### 2. Version History

Every article update creates a version history entry. View versions via:

```
GET /api/admin/articles/:slug/versions?channel=channelId
```

### 3. Advanced Search (Phase 2)

Coming soon:
- Full-text search with PostgreSQL
- Filter by category, author, date range
- Search across all channels

### 4. Analytics

Track article performance:
- View count (auto-incremented on each view)
- More metrics coming in Phase 2

### 5. Multi-user Support (Phase 3)

Coming soon:
- Multiple user accounts
- Role-based access control (admin, editor, author)
- User-specific permissions

## Troubleshooting

### Issue: "DATABASE_URL not found"

**Solution**: Ensure `.env` file exists and contains DATABASE_URL

```bash
cp .env.example .env
# Edit .env and add DATABASE_URL
```

### Issue: "Connection refused"

**Solution**: Check if database is running and accessible

```bash
# Test connection
psql $DATABASE_URL
```

### Issue: "Table already exists"

**Solution**: Drop and recreate tables (⚠️ destroys data)

```bash
# Be careful! This deletes all data
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
npm run db:seed
```

### Issue: Migration script fails

**Solution**: Check content directory structure

```bash
ls -la content/
# Should show channel directories: ambal/, cakranews/, etc.
```

## Rollback to Markdown (Emergency)

If you need to rollback to file-based storage:

1. Checkout previous commit:
   ```bash
   git log --oneline
   git checkout <commit-before-db-migration>
   ```

2. Your markdown files should still be in `content/` directory

3. Reinstall dependencies:
   ```bash
   npm install
   npm run dev
   ```

## Next Steps

After successful migration:

1. ✅ **Phase 1 Complete**: Database persistence
2. 🚧 **Phase 2**: Enhanced search with filters
3. 🚧 **Phase 3**: React admin panel + rich text editor

## Support

For issues or questions:
- Check [GitHub Issues](https://github.com/yourrepo/issues)
- Review migration logs
- Contact system administrator

---

**Migration Date**: November 15, 2025
**Version**: 2.0.0 (Database-backed)
