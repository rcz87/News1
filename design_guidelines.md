# Design Guidelines: Multi-Site News Network Portal

## Design Approach

**Selected Approach:** Reference-Based (Modern News Platforms)

Drawing inspiration from industry leaders: The Guardian, BBC News, and Medium, this design emphasizes clean typography, scannable content hierarchy, and engaging visual storytelling. Each of the 10 news channels will maintain consistent design patterns while allowing unique branding through color schemes and channel-specific identity.

**Core Design Principles:**
- Content-first hierarchy with clear visual separation
- Scannable layouts optimized for quick news consumption
- Consistent patterns across all 10 subdomains with channel differentiation
- Performance-optimized imagery and lazy loading
- Mobile-responsive from ground up

---

## Typography System

**Font Families:**
- Headlines: Inter (700, 800 weights) - bold, modern sans-serif for impact
- Body Text: Inter (400, 500 weights) - excellent readability
- Accent/Meta: Inter (300, 600 weights) - timestamps, categories, bylines

**Type Scale:**
- Hero Headline: text-5xl md:text-6xl lg:text-7xl (60-72px)
- Article Headline: text-3xl md:text-4xl (36-48px)
- Card Headline: text-xl md:text-2xl (24-32px)
- Section Title: text-2xl md:text-3xl (30-36px)
- Body Text: text-base md:text-lg (16-18px) with leading-relaxed
- Meta Text: text-sm (14px)
- Caption: text-xs (12px)

**Typography Guidelines:**
- Maximum line-width for articles: max-w-3xl (prose format)
- Line height for body: leading-relaxed (1.625)
- Headlines: leading-tight (1.25) for visual impact

---

## Layout System

**Spacing Primitives:**
Use Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24**

- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20 (mobile to desktop)
- Card gaps: gap-4, gap-6, gap-8
- Container padding: px-4 md:px-6 lg:px-8

**Grid System:**
- Homepage: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Featured section: 2-column split (lg:grid-cols-2) 
- Category pages: 4-column grid for thumbnails (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Article layout: Single column with max-w-3xl center alignment

**Container Strategy:**
- Max width: max-w-7xl mx-auto
- Full-width sections with inner containers for alignment
- Consistent horizontal padding across breakpoints

---

## Component Library

### Navigation System
**Top Navigation Bar:**
- Fixed/sticky header with backdrop-blur-lg for modern glass effect
- Height: h-16 md:h-20
- Logo left, main navigation center, search/social right
- Mobile: Hamburger menu with slide-in drawer
- Channel switcher dropdown (access to all 10 subdomains)

**Category Navigation:**
- Horizontal scroll on mobile, full display on desktop
- Pills/tabs style: rounded-full px-4 py-2
- Active state with subtle background and border

### Article Cards
**Standard News Card:**
- Aspect ratio image: aspect-video or aspect-[4/3]
- Hover effect: subtle scale transform (hover:scale-105 transition-transform)
- Card structure: Image → Category badge → Headline → Excerpt → Meta (author, date)
- Spacing: p-4 with gap-3 between elements

**Featured/Hero Card:**
- Large format: Full-width or 2/3 layout split
- Prominent headline with text-4xl md:text-5xl
- Gradient overlay on image for text readability (from-black/60 to-transparent)

**Compact List Card:**
- Horizontal layout: Image thumbnail (w-24 h-24) + Text content
- Used in sidebar or secondary sections
- Minimal spacing for density

### Homepage Layout
**Hero Section:**
- Large featured article with full-width image background
- Height: min-h-[500px] md:min-h-[600px]
- Gradient overlay for text contrast
- Headline, excerpt, category badge, and CTA button
- Positioned content: absolute bottom with p-8 md:p-12

**Breaking News Banner:**
- Top banner below header (if needed): bg-red-600 text-white
- Marquee/scroll effect for urgent updates
- Dismissible with close button

**Content Grid:**
- Top stories: 3-column grid of standard cards
- Trending section: 4-column grid of compact cards with numbering
- Category sections: 2-3 featured cards per category
- Latest updates: List view with timestamps

### Article Detail Page
**Article Header:**
- Full-width featured image with aspect-[21/9]
- Overlay gradient for headline readability
- Category badge, headline, byline, publish date
- Share buttons positioned top-right

**Article Body:**
- max-w-3xl centered container
- Comfortable reading: text-lg leading-relaxed
- Paragraph spacing: space-y-4
- Pull quotes: border-l-4 pl-6 text-xl italic
- Images: Full-width with captions

**Related Articles:**
- 3-4 card grid at article end
- "You might also like" section heading

### Sidebar Components
**Trending Topics:**
- Numbered list (1-5) with compact cards
- Small thumbnails with headlines only

**Newsletter Signup:**
- Inline form with email input + submit button
- Compelling copy and privacy note

**Social Media Links:**
- Icon grid or vertical list
- Subtle hover effects

### Footer
**Multi-Column Footer:**
- 4-column layout on desktop, stack on mobile
- Column 1: Channel logo and tagline
- Column 2: Quick links (About, Contact, Privacy)
- Column 3: All 10 subdomain links
- Column 4: Social media and newsletter signup
- Bottom bar: Copyright and legal links

---

## Channel Differentiation Strategy

Each of the 10 subdomains maintains identical structure but unique identity through:

**Brand Variables (per channel):**
- Primary accent color for links, buttons, category badges
- Secondary color for hover states
- Channel logo/wordmark
- Unique tagline/slogan
- Custom favicon

**Consistent Across All Channels:**
- Layout structure and spacing
- Typography system
- Component design patterns
- Navigation structure
- Interaction patterns

---

## Images Strategy

**Homepage Hero:**
- Large, impactful news photography: min-h-[500px] md:min-h-[600px]
- Gradient overlay: from-black/70 via-black/40 to-transparent
- Positioned text with maximum contrast

**Article Cards:**
- Thumbnail images: aspect-video (16:9) for consistency
- Lazy loading for performance
- Fallback placeholder with gradient background

**Article Detail:**
- Featured image: aspect-[21/9] cinematic format
- In-article images: Full-width or centered with captions
- Image galleries: Grid layout with lightbox functionality

**Placeholder Strategy:**
- Use gradient backgrounds with category-specific hues
- Icon or initial letter overlay for missing images
- Maintain aspect ratios even without images

---

## Responsive Breakpoints

- Mobile: base (< 640px)
- Tablet: md (768px+)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

**Mobile-First Considerations:**
- Stack all grids to single column
- Hamburger navigation
- Touch-friendly tap targets (min h-12)
- Simplified hero layouts
- Reduced font sizes with readable minimums

---

## Performance Guidelines

- Lazy load images below the fold
- Optimize images: WebP format, responsive srcset
- Minimize animation usage - only on hover/focus
- Use skeleton loaders for content loading states
- Implement infinite scroll or pagination for article lists

---

## Accessibility

- Semantic HTML5 elements (article, section, nav, aside)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators on all interactive elements
- Alt text for all images
- Color contrast ratios meeting WCAG AA standards