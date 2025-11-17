import { db, articles, type Article } from "../db/index";
import { eq, and, desc, or, like, sql, ilike } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { marked } from "marked";
import { CHANNELS } from "../shared/channels";

/**
 * Content Service - Database-backed article management
 * Reads articles from PostgreSQL database using Drizzle ORM
 */
export class ContentService {
  /**
   * Get all articles for a specific channel
   */
  async getArticlesByChannel(channelId: string): Promise<Article[]> {
    // Temporarily force file system fallback due to database issues
    console.log(`Using file system fallback for channel ${channelId}`);
    return this.getArticlesFromFiles(channelId);

    // Original database code (disabled for now)
    /*
    try {
      const channelArticles = await db.query.articles.findMany({
        where: and(
          eq(articles.channelId, channelId),
          eq(articles.status, "published")
        ),
        orderBy: [desc(articles.publishedAt)],
      });

      return channelArticles.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error reading articles for channel ${channelId}:`, error);
      // Fallback to file system
      console.log(`Falling back to file system for channel ${channelId}`);
      return this.getArticlesFromFiles(channelId);
    }
    */
  }

  /**
   * Get a single article by channel and slug
   */
  async getArticle(channelId: string, slug: string): Promise<Article | null> {
    // Temporarily force file system fallback due to database issues
    console.log(`Using file system fallback for article ${channelId}/${slug}`);
    return this.getArticleFromFile(channelId, slug);

    // Original database code (disabled for now)
    /*
    try {
      const article = await db.query.articles.findFirst({
        where: and(
          eq(articles.channelId, channelId),
          eq(articles.slug, slug),
          eq(articles.status, "published")
        ),
      });

      if (!article) {
        return null;
      }

      // Increment view count
      await db
        .update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, article.id));

      return this.formatArticleForAPI(article);
    } catch (error) {
      console.error(`Error reading article ${channelId}/${slug}:`, error);
      // Fallback to file system
      console.log(`Falling back to file system for article ${channelId}/${slug}`);
      return this.getArticleFromFile(channelId, slug);
    }
    */
  }

  /**
   * Get articles by category for a specific channel
   */
  async getArticlesByCategory(channelId: string, category: string): Promise<Article[]> {
    try {
      const categoryArticles = await db.query.articles.findMany({
        where: and(
          eq(articles.channelId, channelId),
          eq(articles.category, category),
          eq(articles.status, "published")
        ),
        orderBy: [desc(articles.publishedAt)],
      });

      return categoryArticles.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error reading articles for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get featured articles for a specific channel
   */
  async getFeaturedArticles(channelId: string): Promise<Article[]> {
    try {
      const featuredArticles = await db.query.articles.findMany({
        where: and(
          eq(articles.channelId, channelId),
          eq(articles.featured, true),
          eq(articles.status, "published")
        ),
        orderBy: [desc(articles.publishedAt)],
        limit: 10,
      });

      return featuredArticles.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error reading featured articles:`, error);
      return [];
    }
  }

  /**
   * Get all articles across all channels (for admin/search)
   */
  async getAllArticles(): Promise<Article[]> {
    try {
      const allArticles = await db.query.articles.findMany({
        where: eq(articles.status, "published"),
        orderBy: [desc(articles.publishedAt)],
        limit: 1000, // Reasonable limit for performance
      });

      return allArticles.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error reading all articles:`, error);
      return [];
    }
  }

  /**
   * Get unique categories for a channel
   */
  async getCategories(channelId: string): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ category: articles.category })
        .from(articles)
        .where(
          and(eq(articles.channelId, channelId), eq(articles.status, "published"))
        )
        .orderBy(articles.category);

      return result.map((r) => r.category).filter(Boolean);
    } catch (error) {
      console.error(`Error reading categories:`, error);
      return [];
    }
  }

  /**
   * Search articles using PostgreSQL full-text search
   * Uses tsvector and tsquery for fast, ranked search results
   */
  async searchArticles(channelId: string, query: string): Promise<Article[]> {
    try {
      // Create tsquery from search terms
      const searchQuery = query
        .trim()
        .split(/\s+/)
        .filter(term => term.length > 0)
        .join(' & ');

      if (!searchQuery) {
        return [];
      }

      // Use PostgreSQL full-text search with ranking
      const searchResults = await db
        .select()
        .from(articles)
        .where(
          and(
            eq(articles.channelId, channelId),
            eq(articles.status, "published"),
            sql`${articles.searchVector} @@ to_tsquery('english', ${searchQuery})`
          )
        )
        .orderBy(
          // Order by relevance rank (higher rank = better match)
          desc(sql`ts_rank(${articles.searchVector}, to_tsquery('english', ${searchQuery}))`),
          desc(articles.publishedAt)
        )
        .limit(100);

      return searchResults.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error in full-text search:`, error);
      // Fallback to basic ILIKE search if full-text search fails
      return this.searchArticlesFallback(channelId, query);
    }
  }

  /**
   * Fallback search using ILIKE (in case full-text search fails)
   */
  private async searchArticlesFallback(channelId: string, query: string): Promise<Article[]> {
    try {
      const lowercaseQuery = `%${query.toLowerCase()}%`;

      const searchResults = await db.query.articles.findMany({
        where: and(
          eq(articles.channelId, channelId),
          eq(articles.status, "published"),
          or(
            ilike(articles.title, lowercaseQuery),
            ilike(articles.excerpt, lowercaseQuery),
            ilike(articles.content, lowercaseQuery)
          )
        ),
        orderBy: [desc(articles.publishedAt)],
        limit: 100,
      });

      return searchResults.map(this.formatArticleForAPI);
    } catch (error) {
      console.error(`Error in fallback search:`, error);
      return [];
    }
  }

  /**
   * Advanced search with filters (Phase 2)
   */
  async searchArticlesAdvanced(params: {
    channelId?: string;
    query?: string;
    category?: string;
    author?: string;
    startDate?: Date;
    endDate?: Date;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ articles: Article[]; total: number }> {
    try {
      const conditions = [];

      // Channel filter
      if (params.channelId) {
        conditions.push(eq(articles.channelId, params.channelId));
      }

      // Status filter (always published for public)
      conditions.push(eq(articles.status, "published"));

      // Text search using full-text search
      if (params.query) {
        const searchQuery = params.query
          .trim()
          .split(/\s+/)
          .filter(term => term.length > 0)
          .join(' & ');

        if (searchQuery) {
          conditions.push(
            sql`${articles.searchVector} @@ to_tsquery('english', ${searchQuery})`
          );
        }
      }

      // Category filter
      if (params.category) {
        conditions.push(eq(articles.category, params.category));
      }

      // Author filter
      if (params.author) {
        conditions.push(ilike(articles.author, `%${params.author}%`));
      }

      // Date range filter
      if (params.startDate) {
        conditions.push(sql`${articles.publishedAt} >= ${params.startDate}`);
      }
      if (params.endDate) {
        conditions.push(sql`${articles.publishedAt} <= ${params.endDate}`);
      }

      // Featured filter
      if (params.featured !== undefined) {
        conditions.push(eq(articles.featured, params.featured));
      }

      // Build query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(whereClause);

      const total = Number(totalResult[0]?.count || 0);

      // Get articles with pagination
      const searchResults = await db.query.articles.findMany({
        where: whereClause,
        orderBy: [desc(articles.publishedAt)],
        limit: params.limit || 50,
        offset: params.offset || 0,
      });

      return {
        articles: searchResults.map(this.formatArticleForAPI),
        total,
      };
    } catch (error) {
      console.error(`Error in advanced search:`, error);
      return { articles: [], total: 0 };
    }
  }

  /**
   * Format article for API response
   * Converts database article to shared Article type
   */
  private formatArticleForAPI(article: any): Article {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      authorId: article.authorId,
      channelId: article.channelId,
      channel: CHANNELS[article.channelId]?.name,
      category: article.category,
      tags: article.tags || [],
      image: article.image,
      imageAlt: article.imageAlt || article.title,
      status: article.status,
      featured: article.featured,
      publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
      scheduledFor: article.scheduledFor?.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      metaKeywords: article.metaKeywords || [],
      viewCount: article.viewCount || 0,
      searchVector: article.searchVector,
    };
  }

  /**
   * Fallback method to read articles from file system
   * Used when database is not available
   */
  private async getArticlesFromFiles(channelId: string): Promise<Article[]> {
    try {
      const channelPath = path.join(process.cwd(), 'content', channelId);

      try {
        const files = await fs.readdir(channelPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        const articles: Article[] = [];

        for (const file of markdownFiles) {
          try {
            const filePath = path.join(channelPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);

            // Parse frontmatter and content
            const { data: frontmatter, content: articleContent } = this.parseMarkdownFrontmatter(content);

            const slug = file.replace('.md', '');

            const article: Article = {
              id: slug,
              slug,
              title: frontmatter.title || this.slugToTitle(slug),
              excerpt: frontmatter.excerpt || this.generateExcerpt(articleContent),
              content: articleContent,
              author: frontmatter.author || 'Admin',
              authorId: frontmatter.authorId || 'admin',
              channelId,
              channel: CHANNELS[channelId]?.name,
              category: frontmatter.category || 'Berita',
              tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
              image: frontmatter.image || '',
              imageAlt: frontmatter.imageAlt || frontmatter.title || this.slugToTitle(slug),
              status: 'published',
              featured: frontmatter.featured || false,
              publishedAt: frontmatter.date ? new Date(frontmatter.date).toISOString() : stats.mtime.toISOString(),
              scheduledFor: frontmatter.scheduledFor ? new Date(frontmatter.scheduledFor).toISOString() : undefined,
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
              metaTitle: frontmatter.metaTitle,
              metaDescription: frontmatter.metaDescription,
              metaKeywords: Array.isArray(frontmatter.metaKeywords) ? frontmatter.metaKeywords : [],
              viewCount: 0,
            };

            articles.push(article);
          } catch (fileError) {
            console.error(`Error reading file ${file}:`, fileError);
          }
        }

        // Sort by published date (newest first)
        return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      } catch (dirError) {
        console.error(`Channel directory not found: ${channelPath}`, dirError);
        return [];
      }
    } catch (error) {
      console.error(`Error reading articles from files for channel ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Fallback method to read a single article from file system
   * Used when database is not available
   */
  private async getArticleFromFile(channelId: string, slug: string): Promise<Article | null> {
    try {
      const filePath = path.join(process.cwd(), 'content', channelId, `${slug}.md`);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        // Parse frontmatter and content
        const { data: frontmatter, content: articleContent } = this.parseMarkdownFrontmatter(content);

        const article: Article = {
          id: slug,
          slug,
          title: frontmatter.title || this.slugToTitle(slug),
          excerpt: frontmatter.excerpt || this.generateExcerpt(articleContent),
          content: articleContent,
          author: frontmatter.author || 'Admin',
          authorId: frontmatter.authorId || 'admin',
          channelId,
          channel: CHANNELS[channelId]?.name,
          category: frontmatter.category || 'Berita',
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          image: frontmatter.image || '',
          imageAlt: frontmatter.imageAlt || frontmatter.title || this.slugToTitle(slug),
          status: 'published',
          featured: frontmatter.featured || false,
          publishedAt: frontmatter.date ? new Date(frontmatter.date).toISOString() : stats.mtime.toISOString(),
          scheduledFor: frontmatter.scheduledFor ? new Date(frontmatter.scheduledFor).toISOString() : undefined,
          createdAt: stats.birthtime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          metaTitle: frontmatter.metaTitle,
          metaDescription: frontmatter.metaDescription,
          metaKeywords: Array.isArray(frontmatter.metaKeywords) ? frontmatter.metaKeywords : [],
          viewCount: 0,
        };

        return article;
      } catch (fileError) {
        console.error(`Article file not found: ${filePath}`, fileError);
        return null;
      }
    } catch (error) {
      console.error(`Error reading article from file ${channelId}/${slug}:`, error);
      return null;
    }
  }

  /**
   * Parse markdown frontmatter
   */
  private parseMarkdownFrontmatter(content: string): { data: any; content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (match) {
      const frontmatterStr = match[1];
      const articleContent = match[2];

      try {
        // Simple frontmatter parser (basic key: value pairs)
        const frontmatter: any = {};
        const lines = frontmatterStr.split('\n');

        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }

            // Parse arrays (comma-separated)
            if (key.includes('tags') || key.includes('keywords')) {
              value = value.split(',').map((item: string) => item.trim()).filter(Boolean);
            }

            frontmatter[key] = value;
          }
        }

        return { data: frontmatter, content: articleContent };
      } catch (parseError) {
        console.error('Error parsing frontmatter:', parseError);
        return { data: {}, content };
      }
    }

    return { data: {}, content };
  }

  /**
   * Convert slug to title
   */
  private slugToTitle(slug: string): string {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    const plainText = content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }
}

export const contentService = new ContentService();
