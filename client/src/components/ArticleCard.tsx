import { Link } from "wouter";
import { Calendar, User } from "lucide-react";
import { ArticleListItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useChannel } from "@/lib/channel-context";
import { useLocation } from "wouter";
import { useState } from "react";

interface ArticleCardProps {
  article: ArticleListItem;
  variant?: "default" | "featured" | "compact";
}

// Normalize image URL to ensure proper loading
const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/default.jpg';
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http')) return url;
  
  // If it starts with /, it's already a relative path
  if (url.startsWith('/')) return url;
  
  // Otherwise, add leading slash
  return `/${url}`;
};

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  const { channel } = useChannel();
  const [location] = useLocation();
  
  // Debug logging to help identify the issue
  console.log('ArticleCard Debug:', {
    articleSlug: article.slug,
    articleTitle: article.title,
    channel: channel?.id || 'NO_CHANNEL',
    channelExists: !!channel,
    variant
  });
  
  // Fallback: If no channel context, try to extract channel from current path
  const fallbackChannel = channel || (() => {
    const pathMatch = location.match(/^\/([^\/]+)/);
    return pathMatch ? { id: pathMatch[1] } : null;
  })();
  
  if (!fallbackChannel) {
    console.warn('ArticleCard: No channel available for article:', article.slug);
    return (
      <div className="border border-red-500 p-4 rounded-md">
        <p className="text-red-500">Error: No channel available</p>
        <p>Article: {article.title}</p>
        <p>Slug: {article.slug}</p>
        <p>Current path: {location}</p>
      </div>
    );
  }
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const normalizedImageUrl = normalizeImageUrl(article.image);
  const fallbackImageUrl = '/images/default.jpg';

  const handleImageError = () => {
    console.warn('ArticleCard: Image failed to load:', normalizedImageUrl);
    setImageError(true);
  };

  if (variant === "featured") {
    return (
      <Link 
        href={`/${fallbackChannel.id}/article/${article.slug}`}
        className="group block rounded-md min-h-[500px] md:min-h-[600px] hover-elevate active-elevate-2 cursor-pointer" 
        data-testid={`card-article-featured-${article.slug}`}
      >
        {/* Title and metadata above image */}
        <div className="p-6 md:p-8">
          <Badge className="mb-3" data-testid={`badge-category-${article.category}`}>
            {article.category}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        
        {/* Image below title */}
        <div className="aspect-video md:aspect-[16/9] rounded-md overflow-hidden bg-muted">
          <img 
            src={imageError ? fallbackImageUrl : normalizedImageUrl} 
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 object-center"
            style={{ objectPosition: 'center 20%' }}
            onError={handleImageError}
          />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link 
        href={`/${fallbackChannel.id}/article/${article.slug}`}
        className="group flex gap-4 hover-elevate active-elevate-2 p-2 rounded-md -m-2 cursor-pointer" 
        data-testid={`card-article-compact-${article.slug}`}
      >
        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
          <img 
            src={imageError ? fallbackImageUrl : normalizedImageUrl} 
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 object-center"
            style={{ objectPosition: 'center 20%' }}
            onError={handleImageError}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-1 text-xs" data-testid={`badge-category-${article.category}`}>
            {article.category}
          </Badge>
          <h3 className="font-semibold text-sm md:text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/${fallbackChannel.id}/article/${article.slug}`}
      className="group block hover-elevate active-elevate-2 rounded-md overflow-hidden -m-2 p-2 cursor-pointer" 
      data-testid={`card-article-${article.slug}`}
    >
      <div className="aspect-video rounded-md overflow-hidden bg-muted mb-4">
        <img 
          src={imageError ? fallbackImageUrl : normalizedImageUrl} 
          alt={article.imageAlt || article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 object-center"
          style={{ objectPosition: 'center 20%' }}
          onError={handleImageError}
        />
      </div>
      <div className="space-y-3">
        <Badge variant="secondary" data-testid={`badge-category-${article.category}`}>
          {article.category}
        </Badge>
        <h3 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
