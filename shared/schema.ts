import { z } from "zod";

// Channel configuration schema
export const channelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
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

// Article frontmatter schema
export const articleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  image: z.string(),
  imageAlt: z.string().optional(),
  content: z.string(),
  channelId: z.string(),
});

export type Article = z.infer<typeof articleSchema>;

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
