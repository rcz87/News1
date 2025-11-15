import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface SplitScreenLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function SplitScreenLayout({ articles, isLoading }: SplitScreenLayoutProps) {
  const { channel } = useChannel();
  const featuredArticles = articles?.filter(a => a.featured).slice(0, 3) || [];
  const trendingArticles = articles?.filter(a => !a.featured).slice(0, 6) || [];
  const recentArticles = articles?.slice(6, 12) || [];

  return (
    <main className="flex-1">
      {/* Split Hero - Two Equal Sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
        {/* Left Side - Featured Large */}
        {isLoading ? (
          <div className="relative overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ) : featuredArticles[0] ? (
          <Link href={`/${channel?.id}/article/${featuredArticles[0].slug}`}>
            <div className="relative overflow-hidden group cursor-pointer h-full">
              <img
                src={featuredArticles[0].image}
                alt={featuredArticles[0].imageAlt || featuredArticles[0].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <Badge variant="secondary" className="mb-4">
                  {featuredArticles[0].category}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 line-clamp-3">
                  {featuredArticles[0].title}
                </h2>
                <p className="text-lg opacity-90 line-clamp-2 mb-4">
                  {featuredArticles[0].excerpt}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span>{featuredArticles[0].author}</span>
                  <span>•</span>
                  <span>{new Date(featuredArticles[0].publishedAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        {/* Right Side - Stacked Medium Articles */}
        <div className="grid grid-rows-2">
          {isLoading ? (
            <>
              <Skeleton className="w-full h-full" />
              <Skeleton className="w-full h-full" />
            </>
          ) : (
            <>
              {featuredArticles[1] && (
                <Link href={`/${channel?.id}/article/${featuredArticles[1].slug}`}>
                  <div className="relative overflow-hidden group border-b lg:border-l cursor-pointer h-full">
                    <img
                      src={featuredArticles[1].image}
                      alt={featuredArticles[1].imageAlt || featuredArticles[1].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-white">
                      <Badge variant="outline" className="mb-2 text-white border-white">
                        {featuredArticles[1].category}
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-bold line-clamp-2 mb-2">
                        {featuredArticles[1].title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {featuredArticles[1].excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
              {featuredArticles[2] && (
                <Link href={`/${channel?.id}/article/${featuredArticles[2].slug}`}>
                  <div className="relative overflow-hidden group lg:border-l cursor-pointer h-full">
                    <img
                      src={featuredArticles[2].image}
                      alt={featuredArticles[2].imageAlt || featuredArticles[2].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-white">
                      <Badge variant="outline" className="mb-2 text-white border-white">
                        {featuredArticles[2].category}
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-bold line-clamp-2 mb-2">
                        {featuredArticles[2].title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {featuredArticles[2].excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </>
          )}
        </div>
      </section>

      {/* Two Column Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Trending */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending</h2>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {trendingArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Recent */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Terbaru</h2>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {recentArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
