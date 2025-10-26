# Multi-Site News Network Portal

A high-performance, scalable multi-site news network platform built with React, Vite, and Express. Features 10 independent news channels with unique branding, markdown-based content management, and full SEO optimization.

## Project Overview

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Stack**: React + Vite + Express + TypeScript  
**Content**: Markdown-based CMS  
**Deployment**: Portable to VPS with wildcard DNS  
**Last Updated**: October 26, 2025

## Architecture

### Channel System
10 independent news channels accessible via subdomains:
- `ambal.domainutama.com` - Ambal News
- `puring.domainutama.com` - Puring News  
- `kebayoran.domainutama.com` - Kebayoran News
- `menteng.domainutama.com` - Menteng News
- `senayan.domainutama.com` - Senayan News
- `cipete.domainutama.com` - Cipete News
- `gandaria.domainutama.com` - Gandaria News
- `pondok.domainutama.com` - Pondok Indah News
- `tebet.domainutama.com` - Tebet News
- `kuningan.domainutama.com` - Kuningan News

Each channel has:
- Unique branding (colors, logo, tagline)
- Independent content library
- Custom SEO metadata
- Category-based organization

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and optimized builds
- TanStack Query for data fetching and caching
- Wouter for lightweight routing
- Tailwind CSS + Shadcn UI components
- Highlight.js for code syntax highlighting

**Backend:**
- Express.js server
- File-based content management (Markdown)
- Gray-matter for frontmatter parsing
- Marked for markdown to HTML conversion
- RESTful API architecture

**Content Management:**
- Markdown files with YAML frontmatter
- Organized by channel in `content/` directory
- No database required (portable!)
- Easy content updates via file upload

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Header.tsx   # Channel-aware navigation
│   │   │   ├── Footer.tsx   # Footer with channel info
│   │   │   ├── ArticleCard.tsx  # Article preview cards
│   │   │   └── SEO.tsx      # Dynamic SEO meta tags
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Channel homepage with featured articles
│   │   │   ├── ArticlePage.tsx  # Full article view with markdown rendering
│   │   │   └── CategoryPage.tsx # Category-filtered articles
│   │   ├── lib/
│   │   │   ├── channel-context.tsx  # Channel context provider
│   │   │   └── queryClient.ts       # TanStack Query configuration
│   │   └── index.css        # Global styles with dark mode support
│   └── index.html
├── server/
│   ├── routes.ts           # API routes for articles
│   ├── content-service.ts  # Markdown content parser and manager
│   ├── storage.ts          # Storage interface (for future features)
│   └── index.ts            # Express server setup
├── shared/
│   ├── channels.ts         # Channel configurations
│   └── schema.ts           # TypeScript types and Zod schemas
├── content/                # Markdown content by channel
│   ├── ambal/
│   ├── puring/
│   ├── kebayoran/
│   ├── menteng/
│   ├── senayan/
│   ├── cipete/
│   ├── gandaria/
│   ├── pondok/
│   ├── tebet/
│   └── kuningan/
├── design_guidelines.md    # Design system documentation
└── DEPLOYMENT.md          # VPS deployment guide
```

## Features Implemented

### Content Management ✅
- [x] Markdown-based content system
- [x] 64 dummy articles across 10 channels (5-7 per channel)
- [x] YAML frontmatter for metadata (title, author, date, category, tags, image)
- [x] Automatic slug generation from filenames
- [x] Category-based organization

### Frontend Components ✅
- [x] Responsive homepage with featured articles
- [x] Article detail page with markdown rendering
- [x] Category browsing pages
- [x] Channel-specific header and footer
- [x] Article cards (featured, standard, compact variants)
- [x] Loading skeletons for better UX
- [x] Dark mode support

### Backend API ✅
- [x] `GET /api/channels/:channelId/articles` - List all articles for a channel
- [x] `GET /api/channels/:channelId/articles/:slug` - Get single article with HTML content
- [x] `GET /api/channels/:channelId/featured` - Get featured articles
- [x] `GET /api/channels/:channelId/categories/:category/articles` - Filter by category
- [x] `GET /api/channels/:channelId/categories` - List all categories
- [x] `GET /api/channels/:channelId/search?q=query` - Search articles
- [x] Markdown to HTML conversion with syntax highlighting

### Channel System ✅
- [x] Subdomain-based channel detection
- [x] Dynamic theming per channel (colors, branding)
- [x] Channel context provider for React
- [x] Localhost development mode (defaults to 'ambal' channel)
- [x] 10 unique channel configurations

### SEO Optimization ✅
- [x] Dynamic meta tags (title, description)
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags
- [x] Article-specific metadata (author, publish date, tags)
- [x] Canonical URLs
- [x] Structured data ready

### Design System ✅
- [x] Modern news platform aesthetic (Guardian/BBC/Medium inspired)
- [x] Consistent typography (Inter font)
- [x] Responsive grid layouts
- [x] Card-based article presentation
- [x] Professional color schemes
- [x] Accessibility considerations

## API Endpoints

### Articles
```
GET /api/channels/{channelId}/articles
Returns: Array of articles (without content)

GET /api/channels/{channelId}/articles/{slug}
Returns: Single article with HTML content

GET /api/channels/{channelId}/featured
Returns: Featured articles for channel

GET /api/channels/{channelId}/categories/{category}/articles
Returns: Articles filtered by category

GET /api/channels/{channelId}/categories
Returns: Array of category names

GET /api/channels/{channelId}/search?q={query}
Returns: Articles matching search query
```

## Content Structure

### Article Frontmatter Example
```yaml
---
title: "Article Title Here"
excerpt: "Brief description of the article"
author: "Author Name"
publishedAt: "2024-01-15T08:00:00Z"
category: "Politik" | "Ekonomi" | "Lifestyle" | "Teknologi" | "Olahraga"
tags: ["tag1", "tag2", "tag3"]
featured: true | false
image: "https://unsplash.com/photo-id?w=1200&h=675"
imageAlt: "Image description"
---

Article content in markdown format...
```

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 5000)
npm run dev

# Access via browser
http://localhost:5000  # Defaults to 'ambal' channel
```

### Building for Production
```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

### Adding New Content
1. Navigate to `content/{channel-id}/` directory
2. Create new `.md` file with article slug as filename
3. Add frontmatter and content
4. Article automatically appears on channel (no restart needed!)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS deployment guide including:
- DNS configuration (wildcard setup)
- Nginx reverse proxy configuration
- SSL certificate setup (Let's Encrypt)
- PM2 process management
- Security hardening
- Performance optimization

## Design Guidelines

See [design_guidelines.md](./design_guidelines.md) for comprehensive design system including:
- Color palette and theming
- Typography hierarchy
- Component specifications
- Layout patterns
- Accessibility guidelines
- Responsive breakpoints

## Future Enhancements

Potential features for future versions:
- [ ] Admin dashboard for content management
- [ ] Real-time content updates via WebSocket
- [ ] Search functionality (full-text search)
- [ ] RSS feed generation per channel
- [ ] Comment system
- [ ] Newsletter subscription
- [ ] Analytics integration
- [ ] Content caching and CDN integration
- [ ] Multi-language support
- [ ] Advanced content scheduling

## Performance Considerations

**Current Optimizations:**
- File-based content (no database overhead)
- Static site generation capability
- Efficient markdown parsing and caching
- Optimized image loading (Unsplash CDN)
- Code splitting and lazy loading
- Gzip compression
- Browser caching headers

**Scalability:**
- Horizontal scaling via PM2 cluster mode
- Nginx reverse proxy with caching
- CDN-ready architecture
- Lightweight dependencies

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License & Credits

**Built with:**
- React + Vite + Express stack
- Shadcn UI component library
- Tailwind CSS
- Marked + Highlight.js
- TanStack Query

**Content:**
- Dummy content for demonstration
- Images from Unsplash
- Indonesian language articles

## Recent Bug Fixes (October 26, 2025)

### SEO Component Memory Leak Fix ✅
- **Issue**: Meta tags were accumulating on navigation, causing memory leaks
- **Fix**: Added cleanup function in useEffect to remove article-specific tags
- **Impact**: SEO meta tags now update properly without duplicates

### Channel Detection Enhancement ✅
- **Issue**: App showed "Channel Tidak Ditemukan" in Replit dev environment
- **Fix**: Enhanced channel detection to handle:
  - Localhost (localhost, 127.0.0.1)
  - Replit environments (*.replit.dev, *.repl.co)
  - Production subdomain routing (channel.domainutama.com)
  - Fallback to 'ambal' channel for any unrecognized environment
- **Impact**: Application now works reliably in all environments

### Testing Status ✅
- E2E testing completed successfully
- All API endpoints verified (200 OK responses)
- Homepage, article pages, and category filtering working correctly
- SEO meta tags updating dynamically without leaks
- Minor React validation warning noted (non-blocking)

---

**Project Status:** ✅ Production Ready - Ready for VPS Deployment  
**Last Updated:** October 26, 2025  
**Maintained by:** Development Team
