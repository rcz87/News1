import { z } from "zod";

// Channel configuration schema
export const channelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  domain: z.string().optional(),
  tagline: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  logo: z.string().optional(),
  description: z.string(),
  keywords: z.array(z.string()),
  socialLinks: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  layoutType: z.enum([
    "magazine",
    "sports",
    "masonry",
    "minimalist",
    "grid",
    "carousel",
    "timeline",
    "splitscreen",
    "cardstack",
    "sidebar"
  ]).default("magazine"),
});

export type ChannelConfig = z.infer<typeof channelConfigSchema>;

// Article schema (database-backed)
export const articleSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  author: z.string(),
  authorId: z.string().optional().nullable(),
  channelId: z.string(),
  channel: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  image: z.string(),
  imageAlt: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  publishedAt: z.string().optional(),
  scheduledFor: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.array(z.string()).optional().nullable(),
  viewCount: z.number().optional().default(0),
});

export type Article = z.infer<typeof articleSchema>;

// Article type without content for list/card components
export type ArticleListItem = Omit<Article, 'content'>;

// Category schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  channelId: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

// User schema (for future authentication)
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Simplified insert schemas for API
export const insertArticleSchema = articleSchema.omit({ slug: true });
export const insertCategorySchema = categorySchema.omit({ id: true });
export const insertUserSchema = userSchema.omit({ id: true });

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
