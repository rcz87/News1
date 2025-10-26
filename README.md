# NEWS - Multi-Site News Network Portal

A high-performance, scalable multi-site news network platform built with React, Vite, and Express. Features 10 independent news channels with unique branding, markdown-based content management, and full SEO optimization.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

### Multi-Channel Architecture
- **10 Independent News Channels** with unique branding and subdomain routing
- Channels: Ambal, Puring, Kebayoran, Menteng, Senayan, Cipete, Gandaria, Pondok Indah, Tebet, Kuningan
- Each channel has custom colors, logos, and content library

### Content Management
- **Markdown-Based CMS** - No database required, fully portable
- 64+ demo articles across all channels
- YAML frontmatter for metadata (title, author, date, category, tags, images)
- Category-based organization (Politik, Ekonomi, Lifestyle, Teknologi, Olahraga)
- Featured articles system

### Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js with RESTful API
- **Styling**: Tailwind CSS + Shadcn UI components
- **Data Fetching**: TanStack Query for caching and state management
- **Routing**: Wouter (lightweight SPA routing)
- **Content**: Gray-matter + Marked + Highlight.js

### SEO Optimization
- Dynamic meta tags (title, description)
- Open Graph tags for social sharing
- Twitter Card support
- Article-specific metadata (author, publish date, tags)
- Canonical URLs
- Structured data ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/rcz87/NEWS.git
cd NEWS

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Development

```bash
# Start dev server (port 5000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (Home, Article, Category)
│   │   └── lib/         # Utilities and context providers
│   └── index.html
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   ├── content-service.ts  # Markdown parser
│   └── index.ts         # Server setup
├── shared/              # Shared types and configurations
│   ├── channels.ts      # Channel configurations
│   └── schema.ts        # TypeScript types
├── content/             # Markdown content by channel
│   ├── ambal/
│   ├── puring/
│   └── ... (10 channels total)
└── DEPLOYMENT.md        # VPS deployment guide
```

## 🌐 Channel System

Each channel operates independently via subdomain routing:

- `ambal.domainutama.com` - Ambal News
- `puring.domainutama.com` - Puring News  
- `kebayoran.domainutama.com` - Kebayoran News
- ... (7 more channels)

**Development Mode**: Defaults to 'ambal' channel on localhost

**Production Mode**: Uses subdomain-based routing with wildcard DNS (`*.domainutama.com`)

## 📝 Adding Content

Articles are markdown files with YAML frontmatter:

```markdown
---
title: "Your Article Title"
excerpt: "Brief description"
author: "Author Name"
publishedAt: "2024-01-15T08:00:00Z"
category: "Politik"
tags: ["tag1", "tag2"]
featured: true
image: "https://example.com/image.jpg"
imageAlt: "Image description"
---

Your article content in **markdown** format...
```

Save files in `content/{channel-id}/article-slug.md`

## 🔌 API Endpoints

```
GET /api/channels/:channelId/articles
GET /api/channels/:channelId/articles/:slug
GET /api/channels/:channelId/featured
GET /api/channels/:channelId/categories
GET /api/channels/:channelId/categories/:category/articles
GET /api/channels/:channelId/search?q=query
```

## 🚢 Deployment

### VPS Deployment (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS deployment guide including:
- Wildcard DNS configuration
- Nginx reverse proxy setup
- SSL certificates (Let's Encrypt)
- PM2 process management
- Performance optimization

### Quick Deploy Steps

1. **DNS Configuration**: Set up wildcard DNS `*.domainutama.com` pointing to your VPS IP
2. **Server Setup**: Install Node.js, PM2, and Nginx
3. **Application Deploy**: Clone repo, install deps, build
4. **Nginx Config**: Configure reverse proxy for subdomain routing
5. **SSL**: Set up Let's Encrypt for HTTPS
6. **Start**: Use PM2 to run the application

## 🎨 Design System

Modern news platform aesthetic inspired by Guardian, BBC, and Medium:

- Clean typography with Inter font
- Card-based article presentation
- Responsive grid layouts
- Professional color schemes per channel
- Dark mode support
- Accessibility considerations

See [design_guidelines.md](./design_guidelines.md) for complete design specifications.

## 🔧 Configuration

### Channel Configuration

Edit `shared/channels.ts` to add/modify channels:

```typescript
{
  id: 'newchannel',
  name: 'New Channel News',
  tagline: 'Your Trusted News Source',
  primaryColor: '210 100% 50%',
  subdomain: 'newchannel'
}
```

### Environment Variables

```bash
PORT=5000                 # Server port
NODE_ENV=development      # development | production
SESSION_SECRET=your_secret
```

## 📊 Performance

- File-based content (no database overhead)
- Optimized image loading via CDN
- Code splitting and lazy loading
- Gzip compression
- Browser caching headers
- Horizontal scaling via PM2 cluster mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your news network!

## 👤 Author

**Development Team**

- GitHub: [@rcz87](https://github.com/rcz87)

## 🙏 Credits

Built with:
- React + Vite + Express
- Shadcn UI component library
- Tailwind CSS
- TanStack Query
- Marked + Highlight.js

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: October 26, 2025
