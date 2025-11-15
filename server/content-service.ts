import { db, articles, type Article } from "../db/index";
import { eq, and, desc, or, like, sql, ilike } from "drizzle-orm";

/**
 * Content Service - Database-backed article management
 * Reads articles from PostgreSQL database using Drizzle ORM
 */
export class ContentService {
  /**
   * Get all articles for a specific channel
   */
  async getArticlesByChannel(channelId: string): Promise<Article[]> {
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
      return [];
    }
  }

  /**
   * Get a single article by channel and slug
   */
  async getArticle(channelId: string, slug: string): Promise<Article | null> {
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
      return null;
    }
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
    };
  }
}

export const contentService = new ContentService();
