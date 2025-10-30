import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SportsPortalLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function SportsPortalLayout({ articles, isLoading }: SportsPortalLayoutProps) {
  const featuredArticle = articles?.find(a => a.featured);
  const recentNews = articles?.filter(a => !a.featured).slice(0, 6) || [];
  const sidebarNews = articles?.slice(6, 10) || [];

  return (
    <main className="flex-1">
      {/* Split Hero + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero - 2 columns */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="w-full h-[400px] rounded-lg" />
            ) : featuredArticle ? (
              <ArticleCard article={featuredArticle} variant="featured" />
            ) : null}
          </div>

          {/* Sidebar - 1 column */}
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
              <h3 className="font-bold text-lg">Berita Terbaru</h3>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sidebarNews.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 bg-muted/20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Update Terkini</h2>

        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[300px] space-y-3">
                <Skeleton className="w-full h-48 rounded-md" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {recentNews.map((article) => (
              <div key={article.slug} className="flex-shrink-0 w-[300px]">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
