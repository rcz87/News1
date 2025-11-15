import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { Calendar, User, ChevronRight, Newspaper } from "lucide-react";

interface MagazineLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function MagazineLayout({ articles, isLoading }: MagazineLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const topStories = articles?.filter(a => !a.featured).slice(0, 3) || [];
  const gridArticles = articles?.filter(a => !a.featured).slice(3, 11) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-white via-slate-50/30 to-white">
      {/* Hero Section - Premium Magazine Style */}
      <div className="border-b-2 border-primary/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          ) : featuredArticle ? (
            <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
              <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 group cursor-pointer">
                {/* Image Section */}
                <div className="relative overflow-hidden rounded-xl shadow-2xl order-2 lg:order-1">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.imageAlt || featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Featured Label Overlay */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg font-bold text-sm backdrop-blur-sm">
                      <Newspaper className="h-4 w-4" />
                      UTAMA
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-center order-1 lg:order-2">
                  <Badge className="w-fit mb-4 text-sm px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20">
                    {featuredArticle.category}
                  </Badge>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors duration-300">
                    {featuredArticle.title}
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(featuredArticle.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6 inline-flex items-center gap-2 text-primary font-semibold group/link">
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover/link:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Top Stories - 3 Column Highlight */}
      {topStories.length > 0 && (
        <section className="border-b bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold">Sorotan Utama</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full aspect-[16/10] rounded-lg" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : (
                topStories.map((article, index) => (
                  <Link
                    key={article.slug}
                    href={`/${channel?.id}/article/${article.slug}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <article className="group cursor-pointer h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-primary/30">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={article.image}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white text-xs shadow-lg">
                            {article.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>

                      {/* Bottom Accent Line */}
                      <div className="h-1 bg-gradient-to-r from-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </article>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Grid Articles - 4 Column Clean Layout */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold">Berita Terkini</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gridArticles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/${channel?.id}/article/${article.slug}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="group cursor-pointer h-full">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-4 bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.imageAlt || article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {article.category}
                    </Badge>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
