import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Article } from "@shared/schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

export class ContentService {
  /**
   * Get all articles for a specific channel
   */
  async getArticlesByChannel(channelId: string): Promise<Article[]> {
    const channelDir = path.join(CONTENT_DIR, channelId);
    
    try {
      const files = await fs.readdir(channelDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      const articles = await Promise.all(
        markdownFiles.map(file => this.parseArticleFile(channelId, file))
      );
      
      // Sort by publishedAt desc (newest first)
      return articles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error(`Error reading articles for channel ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Get a single article by channel and slug
   */
  async getArticle(channelId: string, slug: string): Promise<Article | null> {
    const filePath = path.join(CONTENT_DIR, channelId, `${slug}.md`);
    
    try {
      await fs.access(filePath);
      return await this.parseArticleFile(channelId, `${slug}.md`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get articles by category for a specific channel
   */
  async getArticlesByCategory(channelId: string, category: string): Promise<Article[]> {
    const allArticles = await this.getArticlesByChannel(channelId);
    return allArticles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get featured articles for a specific channel
   */
  async getFeaturedArticles(channelId: string): Promise<Article[]> {
    const allArticles = await this.getArticlesByChannel(channelId);
    return allArticles.filter(article => article.featured);
  }

  /**
   * Get all articles across all channels (for admin/search)
   */
  async getAllArticles(): Promise<Article[]> {
    const channels = await fs.readdir(CONTENT_DIR);
    const channelDirs = [];
    
    for (const channel of channels) {
      const stat = await fs.stat(path.join(CONTENT_DIR, channel));
      if (stat.isDirectory()) {
        channelDirs.push(channel);
      }
    }
    
    const articlesByChannel = await Promise.all(
      channelDirs.map(channel => this.getArticlesByChannel(channel))
    );
    
    return articlesByChannel.flat().sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  /**
   * Parse a markdown file and extract article data
   */
  private async parseArticleFile(channelId: string, filename: string): Promise<Article> {
    const filePath = path.join(CONTENT_DIR, channelId, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const { data, content } = matter(fileContent);
    const slug = filename.replace('.md', '');
    
    // Clean and normalize data from frontmatter
    const title = typeof data.title === 'string' ? data.title.replace(/\*\*/g, '').trim() : '';
    const excerpt = typeof data.excerpt === 'string' ? data.excerpt.replace(/\*/g, '').trim() : '';
    const author = typeof data.author === 'string' ? data.author.trim() : 'Anonymous';
    const category = typeof data.category === 'string' ? data.category.trim() : 'Uncategorized';
    const image = typeof data.image === 'string' ? data.image.trim() : '';
    
    return {
      slug,
      title,
      excerpt,
      author,
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt,
      category,
      tags: Array.isArray(data.tags) ? data.tags : [],
      featured: Boolean(data.featured),
      image,
      imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt.trim() : title,
      content: content.trim(),
      channelId,
    };
  }

  /**
   * Get unique categories for a channel
   */
  async getCategories(channelId: string): Promise<string[]> {
    const articles = await this.getArticlesByChannel(channelId);
    const categories = new Set(articles.map(a => a.category));
    return Array.from(categories).sort();
  }

  /**
   * Search articles by query
   */
  async searchArticles(channelId: string, query: string): Promise<Article[]> {
    const articles = await this.getArticlesByChannel(channelId);
    const lowercaseQuery = query.toLowerCase();
    
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const contentService = new ContentService();
