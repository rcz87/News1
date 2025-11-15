import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { Calendar, Clock, TrendingUp, Sparkles } from "lucide-react";

interface MasonryGridLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function MasonryGridLayout({ articles, isLoading }: MasonryGridLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const otherArticles = articles?.filter(a => !a.featured) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Berita Terkini</h2>
          <p className="text-muted-foreground">Kabar cepat tersebar seperti angin</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className={`
                  ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}
                  ${i === 3 ? 'sm:col-span-2' : ''}
                  ${i === 6 ? 'row-span-2' : ''}
                  rounded-2xl
                `}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            {/* Featured Article - Large Hero Card */}
            {featuredArticle && (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="sm:col-span-2 sm:row-span-2 rounded-2xl overflow-hidden relative group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                  {/* Image with Parallax Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

                  {/* Trending Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                      <TrendingUp className="h-4 w-4" />
                      TRENDING
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    {/* Category Badge */}
                    <Badge
                      className="mb-4 bg-primary/90 backdrop-blur-sm hover:bg-primary border-0 text-sm px-3 py-1"
                    >
                      {featuredArticle.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-3 leading-tight group-hover:text-yellow-300 transition-colors duration-300">
                      {featuredArticle.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-base md:text-lg text-white/90 mb-4 line-clamp-2 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>5 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-transparent rounded-br-full"></div>
                </article>
              </Link>
            )}

            {/* Dynamic Grid Cards - Various Sizes */}
            {otherArticles.slice(0, 11).map((article, index) => {
              // Create dynamic sizing pattern
              const isWide = index === 2 || index === 7;
              const isTall = index === 5 || index === 9;
              const isMedium = index % 4 === 0 && !isTall;

              return (
                <Link
                  key={article.slug}
                  href={`/${channel?.id}/article/${article.slug}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <article
                    className={`
                      ${isWide ? 'sm:col-span-2' : ''}
                      ${isTall ? 'row-span-2' : ''}
                      ${isMedium ? 'sm:col-span-1' : ''}
                      h-full rounded-2xl overflow-hidden relative group cursor-pointer
                      transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl
                      bg-white border border-slate-200
                    `}
                  >
                    {/* Image Container */}
                    <div className={`${isTall ? 'h-3/5' : 'h-2/3'} overflow-hidden relative`}>
                      <img
                        src={article.image}
                        alt={article.imageAlt || article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white text-xs">
                          {article.category}
                        </Badge>
                      </div>

                      {/* View Count Badge (decorative) */}
                      {article.viewCount > 0 && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                          👁️ {article.viewCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`${isTall ? 'h-2/5' : 'h-1/3'} p-4 flex flex-col justify-between bg-white`}>
                      <div>
                        <h3 className={`
                          ${isTall ? 'text-lg md:text-xl' : 'text-base md:text-lg'}
                          font-bold mb-2 line-clamp-2 leading-tight
                          group-hover:text-primary transition-colors duration-300
                        `}>
                          {article.title}
                        </h3>

                        {isTall && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Footer Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>3 min</span>
                        </div>
                      </div>
                    </div>

                    {/* Colored Bottom Border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More Hint */}
        {!isLoading && articles && articles.length > 12 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="h-px w-12 bg-border"></div>
              <span className="text-sm">Scroll untuk melihat lebih banyak</span>
              <div className="h-px w-12 bg-border"></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
