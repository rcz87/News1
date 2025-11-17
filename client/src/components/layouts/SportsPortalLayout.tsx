import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { Flame, Trophy, Zap, Calendar, User, Clock, ChevronRight, Activity } from "lucide-react";

interface SportsPortalLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function SportsPortalLayout({ articles, isLoading }: SportsPortalLayoutProps) {
  const { channel } = useChannel();
  // Use featured article if exists, otherwise use the first article as hero
  const featuredArticle = articles?.find(a => a.featured) || articles?.[0];
  // Get remaining articles (excluding the one used as hero)
  const remainingArticles = articles?.filter(a => a.slug !== featuredArticle?.slug) || [];
  const topStories = remainingArticles.slice(0, 3);
  const recentNews = remainingArticles.slice(3, 9);
  const sidebarNews = remainingArticles.slice(9, 13);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-orange-50 via-white to-red-50/30">
      {/* Sports Broadcast Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6" />
              <span className="text-sm md:text-base font-bold tracking-wide">PORTAL OLAHRAGA</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white hover:bg-red-600 animate-pulse">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Featured Match/News */}
      {featuredArticle && (
        <section className="border-b-2 border-orange-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {isLoading ? (
              <Skeleton className="w-full h-[500px] rounded-2xl" />
            ) : (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-orange-300 hover:border-orange-500">
                  {/* Stadium-style Image */}
                  <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Highlight Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                      <div className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg shadow-2xl">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 fill-current" />
                          <span className="font-bold text-sm tracking-wider">HEADLINE</span>
                        </div>
                      </div>
                      <Badge className="bg-orange-500 text-white hover:bg-orange-600 text-sm px-4 py-2 font-bold shadow-lg">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Match Score Style Content */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight group-hover:text-orange-400 transition-colors">
                      {featuredArticle.title}
                    </h1>

                    <div className="h-1 w-24 bg-orange-500 mb-4"></div>

                    <p className="text-lg md:text-xl text-slate-300 mb-6 leading-relaxed line-clamp-2">
                      {featuredArticle.excerpt}
                    </p>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-white">{featuredArticle.author}</span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div className="flex items-center gap-2 text-orange-400 font-bold">
                        <ChevronRight className="h-4 w-4" />
                        <span>BACA SELENGKAPNYA</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Stories - Scorecard Style */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-black">SOROTAN UTAMA</h2>
                <Flame className="h-6 w-6 text-orange-600" />
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-64 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {topStories.map((article, index) => (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-orange-500 hover:border-red-600">
                        <div className="grid md:grid-cols-5 gap-0">
                          {/* Image */}
                          <div className="md:col-span-2 relative h-48 md:h-auto overflow-hidden">
                            <img
                              src={article.image}
                              alt={article.imageAlt || article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

                            {/* Ranking Badge */}
                            <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-2xl font-black text-white">{index + 1}</span>
                            </div>

                            {/* Category */}
                            <div className="absolute bottom-4 left-4">
                              <Badge className="bg-white/95 text-orange-700 hover:bg-white font-bold shadow-lg">
                                {article.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="md:col-span-3 p-6 flex flex-col justify-between">
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                {article.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(article.publishedAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-orange-600 font-bold">
                                <Zap className="h-3 w-3" />
                                <span>BACA</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Updates Grid */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-black">UPDATE TERKINI</h2>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-80 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentNews.map((article) => (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article className="group cursor-pointer h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-b-4 border-orange-400 hover:border-red-500">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.imageAlt || article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                          {/* Category */}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold shadow-lg">
                              {article.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Live Updates */}
          <div className="space-y-6">
            {/* Live Scoreboard Style */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 shadow-xl border-2 border-orange-400 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <h3 className="text-xl font-black text-white tracking-wide">LIVE UPDATES</h3>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-3 space-y-2">
                      <Skeleton className="h-4 w-full bg-white/20" />
                      <Skeleton className="h-3 w-3/4 bg-white/20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sidebarNews.map((article, index) => (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 group">
                        <div className="flex gap-3">
                          {/* Time Badge */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center shadow-md">
                              <span className="text-xs font-bold text-orange-600">
                                {formatTime(article.publishedAt).split(':')[0]}
                              </span>
                              <span className="text-xs text-slate-600">
                                {formatTime(article.publishedAt).split(':')[1]}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="mb-2 text-xs border-white/50 text-white">
                              {article.category}
                            </Badge>
                            <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 mb-1 group-hover:text-orange-200 transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-white/70">
                              <User className="h-3 w-3" />
                              <span className="truncate">{article.author}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats Footer */}
              <div className="mt-6 pt-6 border-t border-white/30">
                <div className="flex items-center justify-between text-white text-sm">
                  <span className="font-semibold">Total Berita</span>
                  <Badge className="bg-white text-orange-700 hover:bg-white font-bold">
                    {articles?.length || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
