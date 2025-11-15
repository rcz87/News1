import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, Calendar, User, MapPin, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface TimelineLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function TimelineLayout({ articles, isLoading }: TimelineLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const timelineArticles = articles?.filter(a => !a.featured) || [];

  // Group articles by date
  const groupedByDate = timelineArticles.reduce((acc, article) => {
    const date = new Date(article.publishedAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(article);
    return acc;
  }, {} as Record<string, typeof timelineArticles>);

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50/30 via-white to-slate-50/30">
      {/* Global News Agency Header Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-b-4 border-blue-600">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 text-white">
            <Globe className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">BERITA DUNIA - LIVE CHRONICLE</span>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Breaking News */}
      {featuredArticle && (
        <section className="border-b-2 border-blue-200 bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="w-full h-96 rounded-xl" />
              </div>
            ) : (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="cursor-pointer group">
                  {/* Breaking News Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-4 py-2 bg-red-600 text-white font-bold text-sm tracking-wider flex items-center gap-2 shadow-lg">
                      <TrendingUp className="h-4 w-4" />
                      BREAKING NEWS
                    </div>
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 text-sm px-3 py-1">
                      {featuredArticle.category}
                    </Badge>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight group-hover:text-blue-700 transition-colors">
                    {featuredArticle.title}
                  </h1>

                  <div className="h-1 w-24 bg-blue-600 mb-6"></div>

                  <p className="text-xl text-slate-700 mb-6 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="relative overflow-hidden rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-600 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">{featuredArticle.author}</span>
                    </div>
                    <span className="text-slate-400">|</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(featuredArticle.publishedAt)}</span>
                    </div>
                    <span className="text-slate-400">|</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Berita Global</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Chronicle Timeline Feed */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        {/* Timeline Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <Clock className="h-7 w-7 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold">Kronologi Berita</h2>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <div className="flex-shrink-0 w-36">
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <div className="flex-1 space-y-4 pb-12 border-l-4 pl-8">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="w-full h-64 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {Object.entries(groupedByDate).map(([date, articles], dateIndex) => (
              <div key={date}>
                {/* Enhanced Date Header */}
                <div className="flex items-center gap-8 mb-10">
                  <div className="flex-shrink-0 w-36">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-lg border-2 border-blue-500">
                      <div className="text-3xl font-bold text-center mb-1">
                        {date.split(' ')[0]}
                      </div>
                      <div className="text-xs text-center text-blue-100 uppercase tracking-wide">
                        {date.split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-400 to-transparent" />
                </div>

                {/* Articles Chronicle */}
                {articles.map((article, index) => {
                  const isLast = dateIndex === Object.entries(groupedByDate).length - 1 &&
                                 index === articles.length - 1;

                  return (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article
                        className={`flex gap-8 group cursor-pointer ${
                          !isLast ? 'mb-10' : ''
                        }`}
                      >
                        {/* Time Badge */}
                        <div className="flex-shrink-0 w-36 text-right pt-2">
                          <div className="inline-block px-4 py-2 bg-blue-100 rounded-lg border-2 border-blue-200 group-hover:bg-blue-200 group-hover:border-blue-400 transition-colors">
                            <div className="text-sm font-bold text-blue-900">
                              {formatTime(article.publishedAt)}
                            </div>
                            <div className="text-xs text-blue-600">WIB</div>
                          </div>
                        </div>

                        {/* Content with Timeline */}
                        <div className={`flex-1 ${!isLast ? 'border-l-4 border-blue-300' : ''} pl-8 ${!isLast ? 'pb-10' : ''} relative`}>
                          {/* Enhanced Timeline Dot */}
                          <div className="absolute -left-[18px] top-3 w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>

                          {/* Card Content */}
                          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group-hover:border-blue-400">
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                              <img
                                src={article.image}
                                alt={article.imageAlt || article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                              {/* Category Badge on Image */}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg backdrop-blur-sm px-3 py-1.5 text-xs font-bold">
                                  {article.category}
                                </Badge>
                              </div>

                              {/* Live Indicator for Recent News */}
                              {new Date(article.publishedAt).getTime() > Date.now() - 3600000 && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  BARU
                                </div>
                              )}
                            </div>

                            {/* Text Content */}
                            <div className="p-6">
                              <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                                {article.title}
                              </h3>

                              <p className="text-slate-700 mb-5 leading-relaxed line-clamp-3">
                                {article.excerpt}
                              </p>

                              {/* Meta Info Bar */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{article.author}</span>
                                </div>
                                {article.tags && article.tags.length > 0 && (
                                  <>
                                    <span className="text-slate-400">|</span>
                                    <div className="flex gap-2">
                                      {article.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Bottom Accent */}
                            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* End of Timeline Marker */}
        {!isLoading && timelineArticles.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t-2 border-blue-200">
            <div className="h-px w-16 bg-blue-300"></div>
            <div className="text-sm text-slate-500 font-medium">Akhir Kronologi</div>
            <div className="h-px w-16 bg-blue-300"></div>
          </div>
        )}
      </section>
    </main>
  );
}
