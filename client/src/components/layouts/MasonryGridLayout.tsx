import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface MasonryGridLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function MasonryGridLayout({ articles, isLoading }: MasonryGridLayoutProps) {
  const featuredArticle = articles?.find(a => a.featured);
  const otherArticles = articles?.filter(a => !a.featured) || [];

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className={`
                  ${i === 0 ? 'row-span-2' : ''}
                  ${i === 3 ? 'col-span-2' : ''}
                  ${i === 6 ? 'row-span-2' : ''}
                  rounded-lg
                `}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Featured Article - Tall Card */}
            {featuredArticle && (
              <div className="row-span-2 rounded-lg overflow-hidden relative group hover-elevate">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.imageAlt || featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <Badge variant="destructive" className="mb-2">TRENDING</Badge>
                  <h3 className="text-xl font-bold mb-2 line-clamp-3">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-sm opacity-90 line-clamp-2">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Grid - Various Sizes */}
            {otherArticles.slice(0, 11).map((article, index) => {
              // Distribute different card sizes
              const isWide = index === 2 || index === 5;
              const isTall = index === 5 || index === 9;

              return (
                <div
                  key={article.slug}
                  className={`
                    ${isWide ? 'col-span-2' : ''}
                    ${isTall ? 'row-span-2' : ''}
                    hover-elevate
                  `}
                >
                  <ArticleCard
                    article={article}
                    variant={isTall ? "default" : "compact"}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
