import { Link } from "wouter";
import { Calendar, User } from "lucide-react";
import { Article } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`}>
        <a className="group block relative overflow-hidden rounded-md min-h-[500px] md:min-h-[600px]" data-testid={`card-article-featured-${article.slug}`}>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${article.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <Badge className="mb-4" data-testid={`badge-category-${article.category}`}>
              {article.category}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-foreground transition-colors">
              {article.title}
            </h2>
            <p className="text-lg text-white/90 mb-4 leading-relaxed line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-white/80">
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
        </a>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`}>
        <a className="group flex gap-4 hover-elevate active-elevate-2 p-2 rounded-md -m-2" data-testid={`card-article-compact-${article.slug}`}>
          <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
            <img 
              src={article.image} 
              alt={article.imageAlt || article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        </a>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`}>
      <a className="group block hover-elevate active-elevate-2 rounded-md overflow-hidden -m-2 p-2" data-testid={`card-article-${article.slug}`}>
        <div className="aspect-video rounded-md overflow-hidden bg-muted mb-4">
          <img 
            src={article.image} 
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
      </a>
    </Link>
  );
}
