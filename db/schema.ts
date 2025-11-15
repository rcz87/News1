import { pgTable, text, timestamp, boolean, integer, json, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============= USERS & ROLES =============

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // 'admin', 'editor', 'author', 'viewer'
  description: text("description"),
  permissions: json("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // hashed with bcrypt
  fullName: text("full_name"),
  roleId: uuid("role_id").references(() => roles.id),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

// ============= ARTICLES =============

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),

  // Author & Channel
  author: text("author").notNull(),
  authorId: uuid("author_id").references(() => users.id),
  channelId: text("channel_id").notNull(),

  // Metadata
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),

  // Media
  image: text("image").notNull(),
  imageAlt: text("image_alt"),

  // Status & Publishing
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'scheduled', 'archived'
  featured: boolean("featured").notNull().default(false),

  // Dates
  publishedAt: timestamp("published_at"),
  scheduledFor: timestamp("scheduled_for"), // For scheduled publishing
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: json("meta_keywords").$type<string[]>(),

  // Analytics
  viewCount: integer("view_count").notNull().default(0),

  // Full-text search
  searchVector: text("search_vector"), // tsvector for PostgreSQL full-text search
}, (table) => ({
  slugIdx: index("articles_slug_idx").on(table.slug),
  channelSlugIdx: index("articles_channel_slug_idx").on(table.channelId, table.slug),
  channelIdx: index("articles_channel_idx").on(table.channelId),
  statusIdx: index("articles_status_idx").on(table.status),
  publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
  categoryIdx: index("articles_category_idx").on(table.category),
  authorIdIdx: index("articles_author_id_idx").on(table.authorId),
  featuredIdx: index("articles_featured_idx").on(table.featured),
}));

// ============= ARTICLE VERSIONS (Version History) =============

export const articleVersions = pgTable("article_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),

  // Snapshot of article at this version
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().notNull(),
  image: text("image").notNull(),
  imageAlt: text("image_alt"),

  // Version metadata
  versionNumber: integer("version_number").notNull(),
  changeDescription: text("change_description"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  articleIdIdx: index("article_versions_article_id_idx").on(table.articleId),
  createdAtIdx: index("article_versions_created_at_idx").on(table.createdAt),
}));

// ============= CATEGORIES (Separate Table for Better Management) =============

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  channelId: text("channel_id").notNull(),
  color: text("color"), // For UI theming
  icon: text("icon"), // Icon name or emoji
  order: integer("order").notNull().default(0), // For sorting
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  channelSlugIdx: index("categories_channel_slug_idx").on(table.channelId, table.slug),
  channelIdx: index("categories_channel_idx").on(table.channelId),
}));

// ============= RELATIONS =============

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  articles: many(articles),
  articleVersions: many(articleVersions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  versions: many(articleVersions),
}));

export const articleVersionsRelations = relations(articleVersions, ({ one }) => ({
  article: one(articles, {
    fields: [articleVersions.articleId],
    references: [articles.id],
  }),
  createdBy: one(users, {
    fields: [articleVersions.createdBy],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  channel: one(categories, {
    fields: [categories.channelId],
    references: [categories.id],
  }),
}));

// ============= TYPES =============

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export type ArticleVersion = typeof articleVersions.$inferSelect;
export type InsertArticleVersion = typeof articleVersions.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
