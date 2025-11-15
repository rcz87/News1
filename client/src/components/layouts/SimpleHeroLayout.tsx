import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SimpleHeroLayoutProps {
  articles?: Article[];
  isLoading: boolean;
}

export function SimpleHeroLayout({ articles, isLoading }: SimpleHeroLayoutProps) {
  console.log('SimpleHeroLayout:', { articlesCount: articles?.length, isLoading });

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="p-8">
          <Skeleton className="w-full h-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <main className="flex-1">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Tidak Ada Artikel</h1>
          <p>Belum ada artikel yang tersedia untuk channel ini.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Artikel Terbaru</h1>
        
        {/* Hero Article */}
        {articles[0] && (
          <div className="mb-8">
            <ArticleCard article={articles[0]} variant="featured" />
          </div>
        )}

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}
