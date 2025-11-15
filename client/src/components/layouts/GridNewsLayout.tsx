import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { Zap, TrendingUp, Clock, Eye } from "lucide-react";

interface GridNewsLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function GridNewsLayout({ articles, isLoading }: GridNewsLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const regularArticles = articles?.filter(a => !a.featured).slice(0, 20) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Tech-Inspired Header */}
      <div className="border-b border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Info Portal</h1>
              <p className="text-sm text-slate-400">Informasi Cepat & Terpercaya</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Hero - Full Width Tech Style */}
      {featuredArticle && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
            <article className="relative group cursor-pointer overflow-hidden rounded-2xl">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 p-6 md:p-8">
                  {/* Image Section */}
                  <div className="lg:col-span-3 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Trending Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-lg text-xs font-bold animate-pulse">
                        <TrendingUp className="h-3 w-3" />
                        TRENDING
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <Badge className="w-fit mb-3 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30">
                      {featuredArticle.category}
                    </Badge>

                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-slate-300 mb-6 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>
                      {featuredArticle.viewCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          <span>{featuredArticle.viewCount} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* Dense Grid - 5 Columns Tech Cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold">Berita Terkini</h2>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/50">
            Live Updates
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-square rounded-xl bg-slate-700" />
                <Skeleton className="h-3 w-16 bg-slate-700" />
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-3 w-20 bg-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {regularArticles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/${channel?.id}/article/${article.slug}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <article className="group cursor-pointer h-full">
                  {/* Card Container with Gradient Border */}
                  <div className="relative h-full rounded-xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-700">
                      <img
                        src={article.image}
                        alt={article.imageAlt || article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="text-xs bg-slate-900/80 backdrop-blur-sm border-primary/30 text-primary">
                          {article.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 mb-2 leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Tech Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
    </main>
  );
}
