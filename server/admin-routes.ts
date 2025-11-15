import { Router } from 'express';
import { readdir, readFile, writeFile, unlink, stat, rename } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import type { Request, Response, NextFunction } from 'express';

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
    fileSize: 20 * 1024 * 1024 // 20MB limit untuk accept semua mobile photos
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
    console.log('Expected username:', ADMIN_USERNAME);

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

// Get all articles for a channel
router.get('/articles', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { channel } = req.query;
    
    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    const contentDir = join(process.cwd(), 'content', channel as string);
    const files = await readdir(contentDir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));

    const articles = await Promise.all(
      markdownFiles.map(async (file) => {
        const content = await readFile(join(contentDir, file), 'utf-8');
        const lines = content.split('\n');
        
        // Parse frontmatter
        const frontmatter: any = {};
        let inFrontmatter = false;
        let contentStart = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] === '---') {
            if (!inFrontmatter) {
              inFrontmatter = true;
            } else {
              contentStart = i + 1;
              break;
            }
          } else if (inFrontmatter) {
            const match = lines[i].match(/^(\w+):\s*(.+)$/);
            if (match) {
              frontmatter[match[1]] = match[2];
            }
          }
        }

        const bodyContent = lines.slice(contentStart).join('\n').trim();

        return {
          slug: file.replace('.md', ''),
          filename: file,
          ...frontmatter,
          content: bodyContent,
          channel: channel as string
        };
      })
    );

    res.json(articles);
  } catch (error: any) {
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

    const filePath = join(process.cwd(), 'content', channel as string, `${slug}.md`);
    const content = await readFile(filePath, 'utf-8');
    
    const lines = content.split('\n');
    const frontmatter: any = {};
    let inFrontmatter = false;
    let contentStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          contentStart = i + 1;
          break;
        }
      } else if (inFrontmatter) {
        const match = lines[i].match(/^(\w+):\s*(.+)$/);
        if (match) {
          frontmatter[match[1]] = match[2];
        }
      }
    }

    const bodyContent = lines.slice(contentStart).join('\n').trim();

    res.json({
      slug,
      ...frontmatter,
      content: bodyContent,
      channel: channel as string
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new article
router.post('/articles', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { channel, slug, title, excerpt, content, category, author, image, tags } = req.body;

    if (!channel || !slug || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filePath = join(process.cwd(), 'content', channel, `${slug}.md`);
    
    // Properly escape values for YAML
    const escapeYamlValue = (value: string) => {
      if (!value) return '';
      // If value contains special characters, wrap in quotes
      if (value.includes(':') || value.includes('#') || value.includes('*') || 
          value.includes('[') || value.includes(']') || value.includes('{') || 
          value.includes('}') || value.includes('|') || value.includes('>') ||
          value.includes('"') || value.includes("'") || value.includes('\n')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    };

    const frontmatter = [
      '---',
      `title: ${escapeYamlValue(title)}`,
      `slug: ${escapeYamlValue(slug)}`,
      `excerpt: ${escapeYamlValue(excerpt || '')}`,
      `category: ${escapeYamlValue(category || 'Berita')}`,
      `author: ${escapeYamlValue(author || 'Admin')}`,
      `publishedAt: ${new Date().toISOString()}`,
      `image: ${escapeYamlValue(image || '/images/default.jpg')}`,
      `tags: [${tags ? tags.map((tag: string) => `"${tag}"`).join(', ') : ''}]`,
      `featured: false`,
      '---',
      '',
      content
    ].join('\n');

    await writeFile(filePath, frontmatter, 'utf-8');

    res.json({ message: 'Article created successfully', slug });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/articles/:slug', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { channel, title, excerpt, content, category, author, image, tags, featured } = req.body;

    if (!channel) {
      return res.status(400).json({ error: 'Channel parameter required' });
    }

    const filePath = join(process.cwd(), 'content', channel, `${slug}.md`);
    
    // Properly escape values for YAML
    const escapeYamlValue = (value: string) => {
      if (!value) return '';
      // If value contains special characters, wrap in quotes
      if (value.includes(':') || value.includes('#') || value.includes('*') || 
          value.includes('[') || value.includes(']') || value.includes('{') || 
          value.includes('}') || value.includes('|') || value.includes('>') ||
          value.includes('"') || value.includes("'") || value.includes('\n')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    };

    const frontmatter = [
      '---',
      `title: ${escapeYamlValue(title)}`,
      `slug: ${escapeYamlValue(slug)}`,
      `excerpt: ${escapeYamlValue(excerpt || '')}`,
      `category: ${escapeYamlValue(category || 'Berita')}`,
      `author: ${escapeYamlValue(author || 'Admin')}`,
      `publishedAt: ${new Date().toISOString()}`,
      `image: ${escapeYamlValue(image || '/images/default.jpg')}`,
      `tags: [${tags ? tags.map((tag: string) => `"${tag}"`).join(', ') : ''}]`,
      `featured: ${featured || false}`,
      '---',
      '',
      content
    ].join('\n');

    await writeFile(filePath, frontmatter, 'utf-8');

    res.json({ message: 'Article updated successfully' });
  } catch (error: any) {
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

    const filePath = join(process.cwd(), 'content', channel as string, `${slug}.md`);
    await unlink(filePath);

    res.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
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

export default router;
