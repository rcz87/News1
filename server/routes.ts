import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contentService } from "./content-service";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * Get all articles for a specific channel
   * GET /api/channels/:channelId/articles
   */
  app.get("/api/channels/:channelId/articles", async (req, res) => {
    try {
      const { channelId } = req.params;
      const articles = await contentService.getArticlesByChannel(channelId);
      
      // Return articles without full content for list view
      const articlesPreview = articles.map(({ content, ...article }) => article);
      
      res.json(articlesPreview);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  /**
   * Get a single article by slug with full content
   * GET /api/channels/:channelId/articles/:slug
   */
  app.get("/api/channels/:channelId/articles/:slug", async (req, res) => {
    try {
      const { channelId, slug } = req.params;
      const article = await contentService.getArticle(channelId, slug);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // Convert markdown content to HTML
      const htmlContent = await marked(article.content);
      
      res.json({
        ...article,
        htmlContent,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  /**
   * Get featured articles for a channel
   * GET /api/channels/:channelId/featured
   */
  app.get("/api/channels/:channelId/featured", async (req, res) => {
    try {
      const { channelId } = req.params;
      const articles = await contentService.getFeaturedArticles(channelId);
      
      const articlesPreview = articles.map(({ content, ...article }) => article);
      
      res.json(articlesPreview);
    } catch (error) {
      console.error("Error fetching featured articles:", error);
      res.status(500).json({ error: "Failed to fetch featured articles" });
    }
  });

  /**
   * Get articles by category
   * GET /api/channels/:channelId/categories/:category/articles
   */
  app.get("/api/channels/:channelId/categories/:category/articles", async (req, res) => {
    try {
      const { channelId, category } = req.params;
      const articles = await contentService.getArticlesByCategory(channelId, category);
      
      const articlesPreview = articles.map(({ content, ...article }) => article);
      
      res.json(articlesPreview);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ error: "Failed to fetch articles by category" });
    }
  });

  /**
   * Get all categories for a channel
   * GET /api/channels/:channelId/categories
   */
  app.get("/api/channels/:channelId/categories", async (req, res) => {
    try {
      const { channelId } = req.params;
      const categories = await contentService.getCategories(channelId);
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  /**
   * Search articles
   * GET /api/channels/:channelId/search?q=query
   */
  app.get("/api/channels/:channelId/search", async (req, res) => {
    try {
      const { channelId } = req.params;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      
      const articles = await contentService.searchArticles(channelId, q);
      const articlesPreview = articles.map(({ content, ...article }) => article);
      
      res.json(articlesPreview);
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ error: "Failed to search articles" });
    }
  });

  /**
   * Get all articles across all channels (for admin/global search)
   * GET /api/articles
   */
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await contentService.getAllArticles();
      const articlesPreview = articles.map(({ content, ...article }) => article);
      
      res.json(articlesPreview);
    } catch (error) {
      console.error("Error fetching all articles:", error);
      res.status(500).json({ error: "Failed to fetch all articles" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
