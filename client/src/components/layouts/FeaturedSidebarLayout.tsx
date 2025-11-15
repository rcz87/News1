import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Star, Calendar, User, Clock, BookOpen } from "lucide-react";
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Premium Header Divider */}
      <div className="border-b-4 border-primary/30"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Featured - Premium Traditional Style */}
            {isLoading ? (
              <Skeleton className="w-full h-[550px] rounded-none border-4 border-slate-200" />
            ) : featuredArticle ? (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="relative overflow-hidden group cursor-pointer border-4 border-slate-200 hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  {/* Image Container */}
                  <div className="relative h-[350px] overflow-hidden">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Premium Featured Badge */}
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-6 py-3 shadow-xl">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="font-bold text-sm tracking-wider">BERITA UTAMA</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-primary hover:bg-white shadow-lg text-sm px-4 py-2 font-bold">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section - Traditional Newspaper Style */}
                  <div className="bg-white p-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-3">
                      {featuredArticle.title}
                    </h1>

                    <div className="h-1 w-20 bg-primary mb-4"></div>

                    <p className="text-lg text-slate-700 mb-6 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    {/* Meta Info - Newspaper Style */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-200 pt-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{featuredArticle.author}</span>
                      </div>
                      <span className="text-slate-400">|</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>
                      <span className="text-slate-400">|</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>8 menit baca</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ) : null}

            {/* Main Grid - 2x2 Premium Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-80 rounded-none border-2 border-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mainArticles.map((article, index) => (
                  <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                    <article className="group cursor-pointer h-full bg-white border-2 border-slate-200 hover:border-primary/50 transition-all duration-300 shadow hover:shadow-xl overflow-hidden">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs font-bold">
                            {article.category}
                          </Badge>
                        </div>

                        {/* Article Number - Traditional Style */}
                        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center font-bold text-primary shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>

                        {/* Bottom Meta */}
                        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatShortDate(article.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <BookOpen className="h-3 w-3" />
                            <span>Baca</span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Bottom Border */}
                      <div className="h-1 bg-gradient-to-r from-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Premium Traditional Style */}
          <div className="space-y-8">
            {/* Trending Section - Enhanced */}
            <div className="bg-white border-4 border-slate-200 p-6 sticky top-4 shadow-lg">
              {/* Header with decorative line */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <h3 className="text-2xl font-bold">Trending</h3>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-transparent"></div>
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
                <div className="space-y-5">
                  {sidebarTrending.map((article, index) => (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article className="group cursor-pointer border-b border-slate-200 pb-5 last:border-0 hover:bg-slate-50 p-3 -m-3 rounded transition-colors">
                        <div className="flex gap-4">
                          {/* Ranking Number - Premium Style */}
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 flex items-center justify-center font-bold text-xl border-2 ${
                              index === 0 ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg' :
                              index === 1 ? 'bg-slate-400 text-white border-slate-500' :
                              index === 2 ? 'bg-orange-600 text-white border-orange-700' :
                              'bg-white text-slate-700 border-slate-300'
                            }`}>
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="mb-2 text-xs font-semibold">
                              {article.category}
                            </Badge>
                            <h4 className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <TrendingUp className="h-3 w-3" />
                              <span>{formatShortDate(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats Section - Enhanced */}
              <div className="mt-8 pt-6 border-t-2 border-slate-200 space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm font-semibold text-slate-700">Total Artikel</span>
                  <Badge className="bg-primary text-primary-foreground font-bold">
                    {articles?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm font-semibold text-slate-700">Terbit Hari Ini</span>
                  <Badge className="bg-green-600 text-white font-bold">
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

        {/* Bottom Full Width Grid - Premium Style */}
        {bottomGrid.length > 0 && (
          <section className="mt-16 pt-12 border-t-4 border-slate-200">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-10 w-2 bg-primary"></div>
              <h2 className="text-3xl md:text-4xl font-bold">Baca Juga</h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-80 rounded-none border-2 border-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bottomGrid.map((article) => (
                  <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                    <article className="group cursor-pointer h-full bg-white border-2 border-slate-200 hover:border-primary/50 transition-all duration-300 shadow hover:shadow-xl">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                        {/* Category */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/95 text-primary backdrop-blur-sm text-xs font-bold shadow-lg">
                            {article.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatShortDate(article.publishedAt)}</span>
                        </div>
                      </div>

                      {/* Bottom accent */}
                      <div className="h-1 bg-gradient-to-r from-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
