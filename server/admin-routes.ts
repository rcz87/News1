import { Router } from 'express';
import { writeFile, unlink, stat, rename } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';
import { db, articles, users, articleVersions } from '../db/index';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/articles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, 'article-' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Admin credentials - MUST be set via environment variables in production
const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables in production
if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET)) {
  console.error('SECURITY ERROR: Admin credentials not configured!');
  console.error('Required environment variables: ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET');
  process.exit(1);
}

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || (isProduction ? '' : 'admin');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin123');
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'dev-secret-key-change-in-production');

// Additional security check
if (isProduction && (ADMIN_PASSWORD === 'admin123' || JWT_SECRET.includes('change'))) {
  console.error('SECURITY ERROR: Default credentials detected in production!');
  process.exit(1);
}

// Pre-hash password for comparison
let ADMIN_PASSWORD_HASH: string;

// Initialize password hash
async function initPasswordHash() {
  if (!ADMIN_PASSWORD_HASH) {
    ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('Admin password hash initialized');
  }
}

// Initialize password hash on module load
initPasswordHash();

// Authentication middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', username);

    if (username !== ADMIN_USERNAME) {
      console.log('Invalid username');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure password hash is initialized
    await initPasswordHash();

    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!passwordMatch) {
      console.log('Invalid password - mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful');
    res.json({ token, username: ADMIN_USERNAME });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all articles for a channel (with optional status filter)
router.get('/articles', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { channel, status } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    const conditions = [eq(articles.channelId, channel as string)];

    // Admin can see all statuses, default to published
    if (status) {
      conditions.push(eq(articles.status, status as string));
    }

    const channelArticles = await db.query.articles.findMany({
      where: and(...conditions),
      orderBy: [desc(articles.updatedAt)],
    });

    // Format for admin interface (compatible with old format)
    const formattedArticles = channelArticles.map((article) => ({
      slug: article.slug,
      filename: `${article.slug}.md`, // For backwards compatibility
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt?.toISOString(),
      image: article.image,
      tags: article.tags,
      featured: article.featured,
      status: article.status,
      content: article.content,
      channel: article.channelId,
      viewCount: article.viewCount,
    }));

    res.json(formattedArticles);
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/articles/:slug', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.channelId, channel as string),
        eq(articles.slug, slug)
      ),
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Format for admin interface
    res.json({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt?.toISOString(),
      image: article.image,
      imageAlt: article.imageAlt,
      tags: article.tags,
      featured: article.featured,
      status: article.status,
      channel: article.channelId,
      viewCount: article.viewCount,
    });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new article
router.post('/articles', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { channel, slug, title, excerpt, content, category, author, image, imageAlt, tags, featured, status } = req.body;

    if (!channel || !slug || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields: channel, slug, title, content' });
    }

    // Check if article with same slug exists in channel
    const existing = await db.query.articles.findFirst({
      where: and(
        eq(articles.channelId, channel),
        eq(articles.slug, slug)
      ),
    });

    if (existing) {
      return res.status(409).json({ error: 'Article with this slug already exists in this channel' });
    }

    // Create article in database
    const [newArticle] = await db.insert(articles).values({
      slug,
      title,
      excerpt: excerpt || '',
      content,
      author: author || 'Admin',
      channelId: channel,
      category: category || 'Berita',
      tags: tags || [],
      image: image || '/images/default.jpg',
      imageAlt: imageAlt || title,
      featured: featured || false,
      status: status || 'published',
      publishedAt: status === 'published' ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Also export to markdown as backup
    await exportArticleToMarkdown(newArticle);

    res.json({
      message: 'Article created successfully',
      slug,
      id: newArticle.id
    });
  } catch (error: any) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/articles/:slug', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { channel, title, excerpt, content, category, author, image, imageAlt, tags, featured, status } = req.body;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    // Find existing article
    const existingArticle = await db.query.articles.findFirst({
      where: and(
        eq(articles.channelId, channel),
        eq(articles.slug, slug)
      ),
    });

    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Create version history before updating
    await db.insert(articleVersions).values({
      articleId: existingArticle.id,
      title: existingArticle.title,
      excerpt: existingArticle.excerpt,
      content: existingArticle.content,
      category: existingArticle.category,
      tags: existingArticle.tags,
      image: existingArticle.image,
      imageAlt: existingArticle.imageAlt,
      versionNumber: await getNextVersionNumber(existingArticle.id),
      changeDescription: 'Updated via admin panel',
      createdAt: new Date(),
    });

    // Update article
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (author) updateData.author = author;
    if (image) updateData.image = image;
    if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
    if (tags !== undefined) updateData.tags = tags;
    if (featured !== undefined) updateData.featured = featured;
    if (status) {
      updateData.status = status;
      if (status === 'published' && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updatedArticle] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, existingArticle.id))
      .returning();

    // Export to markdown as backup
    await exportArticleToMarkdown(updatedArticle);

    res.json({ message: 'Article updated successfully', slug });
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete article
router.delete('/articles/:slug', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    // Find article
    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.channelId, channel as string),
        eq(articles.slug, slug)
      ),
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Delete from database (cascade will delete versions)
    await db.delete(articles).where(eq(articles.id, article.id));

    // Delete markdown backup file (optional, fail silently)
    try {
      const filePath = join(process.cwd(), 'content', channel as string, `${slug}.md`);
      await unlink(filePath);
    } catch (e) {
      // Markdown file might not exist, ignore
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload photo dengan auto-compression
router.post('/upload-photo', authenticateAdmin, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const originalSize = req.file.size;
    const originalPath = req.file.path;
    const filename = req.file.filename;

    // Generate compressed filename
    const compressedFilename = filename.replace(/\.[^/.]+$/, '_compressed.jpg');
    const compressedPath = originalPath.replace(req.file.filename, compressedFilename);

    try {
      // Compress image menggunakan Sharp
      await sharp(originalPath)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toFile(compressedPath);

      // Get compressed file stats
      const compressedStats = await sharp(compressedPath).metadata();
      const compressedSize = (await stat(compressedPath)).size;

      // Delete original file
      await unlink(originalPath);

      // Rename compressed file to original filename
      await rename(compressedPath, originalPath);

      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      console.log(`Image compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);

      res.json({
        success: true,
        url: `/uploads/articles/${filename}`,
        filename: filename,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: compressionRatio,
        dimensions: {
          width: compressedStats.width,
          height: compressedStats.height
        }
      });

    } catch (compressionError: any) {
      console.error('Compression failed, using original file:', compressionError);
      // Jika compression gagal, gunakan file original
      res.json({
        success: true,
        url: `/uploads/articles/${filename}`,
        filename: filename,
        size: originalSize,
        compression: 'failed',
        error: compressionError.message
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export article to markdown (backup functionality)
async function exportArticleToMarkdown(article: any) {
  try {
    const contentDir = join(process.cwd(), 'content', article.channelId);
    const filePath = join(contentDir, `${article.slug}.md`);

    const frontmatter = [
      '---',
      `title: ${article.title}`,
      `slug: ${article.slug}`,
      `excerpt: ${article.excerpt || ''}`,
      `category: ${article.category || 'Berita'}`,
      `author: ${article.author || 'Admin'}`,
      `publishedAt: ${article.publishedAt?.toISOString() || new Date().toISOString()}`,
      `image: ${article.image || '/images/default.jpg'}`,
      `imageAlt: ${article.imageAlt || article.title}`,
      `tags: [${article.tags ? article.tags.join(', ') : ''}]`,
      `featured: ${article.featured || false}`,
      `status: ${article.status || 'published'}`,
      '---',
      '',
      article.content
    ].join('\n');

    await writeFile(filePath, frontmatter, 'utf-8');
    console.log(`✅ Exported article to markdown: ${article.channelId}/${article.slug}.md`);
  } catch (error) {
    console.error(`❌ Failed to export article to markdown:`, error);
    // Don't throw - markdown export is optional backup
  }
}

// Get next version number for article
async function getNextVersionNumber(articleId: string): Promise<number> {
  const versions = await db.query.articleVersions.findMany({
    where: eq(articleVersions.articleId, articleId),
    orderBy: [desc(articleVersions.versionNumber)],
    limit: 1,
  });

  return versions.length > 0 ? versions[0].versionNumber + 1 : 1;
}

// Get article version history
router.get('/articles/:slug/versions', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.channelId, channel as string),
        eq(articles.slug, slug)
      ),
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const versions = await db.query.articleVersions.findMany({
      where: eq(articleVersions.articleId, article.id),
      orderBy: [desc(articleVersions.createdAt)],
    });

    res.json(versions);
  } catch (error: any) {
    console.error('Error fetching article versions:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
