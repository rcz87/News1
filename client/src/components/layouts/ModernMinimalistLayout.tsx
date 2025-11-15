import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { Snowflake, Calendar, User, Clock } from "lucide-react";

interface ModernMinimalistLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function ModernMinimalistLayout({ articles, isLoading }: ModernMinimalistLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const latestArticles = articles?.filter(a => !a.featured).slice(0, 8) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-cyan-50/30 via-blue-50/20 to-white relative overflow-hidden">
      {/* Frost Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, transparent 20%, rgba(14, 165, 233, 0.3) 21%, rgba(14, 165, 233, 0.3) 24%, transparent 25%, transparent 100%)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Ice Factory Header */}
      <div className="relative border-b-2 border-cyan-200/50 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="h-6 w-6 text-cyan-600 animate-spin" style={{ animationDuration: '20s' }} />
              <span className="text-sm font-medium text-cyan-900 tracking-wide">CRYSTAL CLEAR NEWS</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-700">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="font-medium">FRESH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Ice Crystal Style */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
        ) : featuredArticle ? (
          <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center group cursor-pointer">
              <div className="relative">
                {/* Frost Corner Accent */}
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-cyan-200/30 to-transparent rounded-full blur-2xl"></div>

                <Badge className="mb-5 font-medium bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-200">
                  {featuredArticle.category}
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-6 text-slate-900 group-hover:text-cyan-900 transition-colors">
                  {featuredArticle.title}
                </h1>

                <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500 to-transparent mb-6"></div>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-600" />
                    <span className="font-medium">{featuredArticle.author}</span>
                  </div>
                  <span className="text-cyan-300">•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-600" />
                    <span>{formatDate(featuredArticle.publishedAt)}</span>
                  </div>
                  <span className="text-cyan-300">•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-600" />
                    <span>5 min baca</span>
                  </div>
                </div>
              </div>

              <div className="order-first md:order-last relative">
                {/* Ice Crystal Frame */}
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-2xl blur-xl"></div>
                <div className="relative bg-white p-2 rounded-xl shadow-xl border-2 border-cyan-100 group-hover:border-cyan-300 transition-colors">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.imageAlt || featuredArticle.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />

                  {/* Snowflake Overlay */}
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-cyan-200">
                      <Snowflake className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </div>

      {/* Latest Articles - Clean Ice List */}
      <div className="relative border-t-2 border-cyan-200/50 bg-gradient-to-b from-white to-cyan-50/20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Snowflake className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-light text-slate-900">Berita Terbaru</h2>
              <p className="text-sm text-cyan-700">Segar dari sumber terpercaya</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-8 pb-8 border-b border-cyan-100">
                  <Skeleton className="w-56 h-36 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {latestArticles.map((article, index) => (
                <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                  <article className="flex flex-col md:flex-row gap-6 md:gap-8 pb-8 border-b border-cyan-100/50 last:border-0 group cursor-pointer rounded-xl p-4 -m-4 hover:bg-cyan-50/30 transition-all duration-300">
                    <div className="md:w-56 flex-shrink-0 relative">
                      {/* Ice Frame for Image */}
                      <div className="relative bg-white p-1.5 rounded-lg shadow-md border border-cyan-100 group-hover:border-cyan-300 transition-colors">
                        <img
                          src={article.image}
                          alt={article.imageAlt || article.title}
                          className="w-full aspect-video md:aspect-[4/3] object-cover rounded"
                        />

                        {/* Small Snowflake Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <Badge className="mb-3 font-medium text-xs bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-200">
                        {article.category}
                      </Badge>

                      <h3 className="text-2xl font-light mb-3 text-slate-900 group-hover:text-cyan-900 transition-colors leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-cyan-600" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <span className="text-cyan-300">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-cyan-600" />
                          <span>3 min</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtle Frost Accent */}
                    <div className="hidden md:flex items-center">
                      <div className="w-px h-24 bg-gradient-to-b from-transparent via-cyan-200 to-transparent"></div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Frost Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-50/50 to-transparent pointer-events-none"></div>
      </div>
    </main>
  );
}
