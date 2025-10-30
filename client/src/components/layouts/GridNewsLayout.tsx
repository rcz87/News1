import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface GridNewsLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function GridNewsLayout({ articles, isLoading }: GridNewsLayoutProps) {
  const featuredArticles = articles?.filter(a => a.featured).slice(0, 2) || [];
  const regularArticles = articles?.filter(a => !a.featured) || [];

  return (
    <main className="flex-1 bg-muted/30">
      {/* Top Featured - 2 Large Cards Side by Side */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="w-full h-[400px] rounded-lg" />
            <Skeleton className="w-full h-[400px] rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((article) => (
                <div key={article.slug} className="relative rounded-lg overflow-hidden group hover-elevate">
                  <img
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 p-8 text-white">
                    <Badge variant="destructive" className="mb-3">FEATURED</Badge>
                    <h2 className="text-3xl font-bold mb-3 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm opacity-90 line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.author}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                Belum ada artikel featured
              </div>
            )}
          </div>
        )}
      </section>

      {/* Dense Grid - 5 Columns */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Semua Berita</h2>
          <Badge variant="outline">Terbaru</Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-square rounded-md" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {regularArticles.map((article) => (
              <article
                key={article.slug}
                className="group hover-elevate rounded-lg overflow-hidden bg-background"
              >
                <img
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <Badge variant="outline" className="text-xs mb-2">
                    {article.category}
                  </Badge>
                  <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
