#!/usr/bin/env tsx

/**
 * Migration Script: Import Markdown Articles to PostgreSQL Database
 *
 * This script reads all existing markdown articles from the content/ directory
 * and imports them into the PostgreSQL database using Drizzle ORM.
 *
 * Usage:
 *   tsx scripts/migrate-markdown-to-db.ts
 *
 * Requirements:
 *   - DATABASE_URL environment variable must be set
 *   - Database schema must be already migrated (run drizzle-kit push first)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { db, articles, users, roles } from "../db/index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "../content");

interface MarkdownArticle {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
  imageAlt?: string;
  content: string;
  channelId: string;
}

/**
 * Clean markdown formatting from strings
 */
function cleanMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .trim();
}

/**
 * Read and parse all markdown files from content directory
 */
async function readMarkdownArticles(): Promise<MarkdownArticle[]> {
  const articles: MarkdownArticle[] = [];

  console.log("📖 Reading markdown files from:", CONTENT_DIR);

  // Read all channel directories
  const channels = fs.readdirSync(CONTENT_DIR).filter((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    return fs.statSync(filePath).isDirectory();
  });

  console.log(`📁 Found ${channels.length} channels:`, channels.join(", "));

  for (const channelId of channels) {
    const channelDir = path.join(CONTENT_DIR, channelId);
    const files = fs.readdirSync(channelDir).filter((file) => file.endsWith(".md"));

    console.log(`  📄 Channel "${channelId}": ${files.length} articles`);

    for (const file of files) {
      const filePath = path.join(channelDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const slug = path.basename(file, ".md");

      articles.push({
        slug,
        title: cleanMarkdown(data.title || ""),
        excerpt: cleanMarkdown(data.excerpt || ""),
        author: cleanMarkdown(data.author || "Unknown"),
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        category: data.category || "Berita",
        tags: data.tags || [],
        featured: data.featured || false,
        image: data.image || "",
        imageAlt: data.imageAlt,
        content: content.trim(),
        channelId,
      });
    }
  }

  return articles;
}

/**
 * Create default admin role and user
 */
async function createDefaultAdminUser() {
  console.log("\n👤 Creating default admin user...");

  // Check if admin role exists
  const existingRole = await db.query.roles.findFirst({
    where: eq(roles.name, "admin"),
  });

  let adminRoleId: string;

  if (!existingRole) {
    const [adminRole] = await db
      .insert(roles)
      .values({
        name: "admin",
        description: "Full administrative access",
        permissions: [
          "articles.create",
          "articles.read",
          "articles.update",
          "articles.delete",
          "users.create",
          "users.read",
          "users.update",
          "users.delete",
          "roles.manage",
        ],
      })
      .returning();

    adminRoleId = adminRole.id;
    console.log("  ✅ Created admin role");
  } else {
    adminRoleId = existingRole.id;
    console.log("  ℹ️  Admin role already exists");
  }

  // Create editor and author roles
  const existingEditorRole = await db.query.roles.findFirst({
    where: eq(roles.name, "editor"),
  });

  if (!existingEditorRole) {
    await db.insert(roles).values({
      name: "editor",
      description: "Can create and edit articles",
      permissions: ["articles.create", "articles.read", "articles.update"],
    });
    console.log("  ✅ Created editor role");
  }

  const existingAuthorRole = await db.query.roles.findFirst({
    where: eq(roles.name, "author"),
  });

  if (!existingAuthorRole) {
    await db.insert(roles).values({
      name: "author",
      description: "Can create own articles",
      permissions: ["articles.create", "articles.read"],
    });
    console.log("  ✅ Created author role");
  }

  // Check if admin user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, "admin"),
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );

    await db.insert(users).values({
      username: "admin",
      email: "admin@news1.local",
      password: hashedPassword,
      fullName: "System Administrator",
      roleId: adminRoleId,
      isActive: true,
    });

    console.log("  ✅ Created admin user (username: admin)");
  } else {
    console.log("  ℹ️  Admin user already exists");
  }
}

/**
 * Import articles into database
 */
async function importArticles(markdownArticles: MarkdownArticle[]) {
  console.log(`\n📥 Importing ${markdownArticles.length} articles to database...`);

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const article of markdownArticles) {
    try {
      // Check if article already exists
      const existing = await db.query.articles.findFirst({
        where: (articles, { and, eq }) =>
          and(eq(articles.channelId, article.channelId), eq(articles.slug, article.slug)),
      });

      if (existing) {
        console.log(`  ⏭️  Skipped: ${article.channelId}/${article.slug} (already exists)`);
        skippedCount++;
        continue;
      }

      // Insert article
      await db.insert(articles).values({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        authorId: null, // Will be linked to users later
        channelId: article.channelId,
        category: article.category,
        tags: article.tags,
        image: article.image,
        imageAlt: article.imageAlt,
        status: "published", // Existing articles are published
        featured: article.featured,
        publishedAt: new Date(article.publishedAt),
        createdAt: new Date(article.publishedAt),
        updatedAt: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
      });

      console.log(`  ✅ Imported: ${article.channelId}/${article.slug}`);
      importedCount++;
    } catch (error) {
      console.error(`  ❌ Error importing ${article.channelId}/${article.slug}:`, error);
      errorCount++;
    }
  }

  console.log("\n📊 Import Summary:");
  console.log(`  ✅ Imported: ${importedCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
}

/**
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting markdown to database migration...\n");

  try {
    // Step 1: Create default admin user and roles
    await createDefaultAdminUser();

    // Step 2: Read markdown files
    const markdownArticles = await readMarkdownArticles();

    // Step 3: Import articles to database
    await importArticles(markdownArticles);

    console.log("\n✅ Migration completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Update content-service.ts to read from database");
    console.log("   2. Update admin-routes.ts to write to database");
    console.log("   3. Keep markdown files as backup/export format");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
main();
