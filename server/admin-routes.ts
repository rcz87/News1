import { Router } from 'express';
import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Admin credentials (in production, use database)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Pre-hash password for comparison
let ADMIN_PASSWORD_HASH: string;

// Initialize password hash
async function initPasswordHash() {
  if (!ADMIN_PASSWORD_HASH) {
    ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('Admin password hash initialized');
  }
}

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
    console.log('Expected password:', ADMIN_PASSWORD);
    console.log('Received password:', password);
    console.log('Password match:', password === ADMIN_PASSWORD);

    if (username !== ADMIN_USERNAME) {
      console.log('Invalid username');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simple password comparison for now (in production, use bcrypt)
    if (password !== ADMIN_PASSWORD) {
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
    
    const frontmatter = [
      '---',
      `title: ${title}`,
      `slug: ${slug}`,
      `excerpt: ${excerpt || ''}`,
      `category: ${category || 'Berita'}`,
      `author: ${author || 'Admin'}`,
      `publishedAt: ${new Date().toISOString()}`,
      `image: ${image || '/images/default.jpg'}`,
      `tags: [${tags ? tags.join(', ') : ''}]`,
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
    
    const frontmatter = [
      '---',
      `title: ${title}`,
      `slug: ${slug}`,
      `excerpt: ${excerpt || ''}`,
      `category: ${category || 'Berita'}`,
      `author: ${author || 'Admin'}`,
      `publishedAt: ${new Date().toISOString()}`,
      `image: ${image || '/images/default.jpg'}`,
      `tags: [${tags ? tags.join(', ') : ''}]`,
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

// Upload photo
router.post('/upload-photo', authenticateAdmin, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Return the URL path to the uploaded file
    const url = `/uploads/articles/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      url,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
