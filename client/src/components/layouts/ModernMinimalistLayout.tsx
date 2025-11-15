import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface ModernMinimalistLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function ModernMinimalistLayout({ articles, isLoading }: ModernMinimalistLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const latestArticles = articles?.filter(a => !a.featured).slice(0, 8) || [];

  return (
    <main className="flex-1 bg-background">
      {/* Hero Section - Minimalist */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
        ) : featuredArticle ? (
          <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center cursor-pointer hover:opacity-90 transition-opacity">
              <div>
                <Badge variant="outline" className="mb-4 font-medium">
                  {featuredArticle.category}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
                  {featuredArticle.title}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{featuredArticle.author}</span>
                  <span>•</span>
                  <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                  <span>•</span>
                  <span>5 min baca</span>
                </div>
              </div>
              <div className="order-first md:order-last">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.imageAlt || featuredArticle.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
            </div>
          </Link>
        ) : null}
      </div>

      {/* Latest Articles - List Style */}
      <div className="border-t">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16">
          <h2 className="text-3xl font-light mb-12">Artikel Terbaru</h2>

          {isLoading ? (
            <div className="space-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-8 pb-12 border-b">
                  <Skeleton className="w-56 h-36 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {latestArticles.map((article) => (
                <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                  <article className="flex flex-col md:flex-row gap-8 pb-12 border-b last:border-0 group hover-elevate rounded-lg p-4 -m-4 cursor-pointer">
                    <div className="md:w-56 flex-shrink-0">
                      <img
                        src={article.image}
                        alt={article.imageAlt || article.title}
                        className="w-full aspect-video md:aspect-[4/3] object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-3 font-medium text-xs">
                        {article.category}
                      </Badge>
                      <h3 className="text-2xl font-medium mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
