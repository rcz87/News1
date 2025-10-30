import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MagazineLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function MagazineLayout({ articles, isLoading }: MagazineLayoutProps) {
  const featuredArticle = articles?.find(a => a.featured);
  const topStories = articles?.filter(a => !a.featured).slice(0, 8) || [];

  return (
    <main className="flex-1">
      {/* Hero Section - Full Width */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="w-full h-[500px] md:h-[600px] rounded-md" />
        </div>
      ) : featuredArticle ? (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <ArticleCard article={featuredArticle} variant="featured" />
        </div>
      ) : null}

      {/* Grid 4 Columns */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Berita Terkini</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-video rounded-md" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topStories.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
