import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Star } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface FeaturedSidebarLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function FeaturedSidebarLayout({ articles, isLoading }: FeaturedSidebarLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const mainArticles = articles?.filter(a => !a.featured).slice(0, 4) || [];
  const sidebarTrending = articles?.slice(4, 9) || [];
  const bottomGrid = articles?.slice(9, 15) || [];

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Featured */}
            {isLoading ? (
              <Skeleton className="w-full h-[500px] rounded-lg" />
            ) : featuredArticle ? (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="relative rounded-lg overflow-hidden group hover-elevate cursor-pointer">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.imageAlt || featuredArticle.title}
                    className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <Badge variant="secondary">FEATURED</Badge>
                      <Badge variant="outline" className="text-white border-white">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 line-clamp-3">
                      {featuredArticle.title}
                    </h1>
                    <p className="text-lg text-white/90 mb-4 line-clamp-2">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                      <span className="font-medium">{featuredArticle.author}</span>
                      <span>•</span>
                      <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ) : null}

            {/* Main Grid - 2x2 */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-64 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mainArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Trending Section */}
            <div className="bg-muted/30 rounded-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-bold">Trending</h3>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sidebarTrending.map((article, index) => (
                    <article
                      key={article.slug}
                      className="flex gap-4 group hover-elevate rounded-lg p-2 -m-2"
                    >
                      {/* Ranking Number */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="mb-2 text-xs">
                          {article.category}
                        </Badge>
                        <h4 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>{article.author}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 pt-6 border-t space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Artikel</span>
                  <span className="font-bold">{articles?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Hari Ini</span>
                  <Badge variant="secondary">
                    {articles?.filter(a => {
                      const today = new Date().toDateString();
                      const articleDate = new Date(a.publishedAt).toDateString();
                      return today === articleDate;
                    }).length || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full Width Grid */}
        {bottomGrid.length > 0 && (
          <section className="mt-12 pt-12 border-t">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Baca Juga</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-64 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bottomGrid.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
