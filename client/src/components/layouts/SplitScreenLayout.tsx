import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Anchor, Waves, Calendar, User, Compass, Ship, Navigation } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface SplitScreenLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function SplitScreenLayout({ articles, isLoading }: SplitScreenLayoutProps) {
  const { channel } = useChannel();
  const featuredArticles = articles?.filter(a => a.featured).slice(0, 3) || [];
  const portArticles = articles?.filter(a => !a.featured).slice(0, 6) || [];
  const starboardArticles = articles?.slice(6, 12) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-cyan-50 via-blue-50/30 to-white">
      {/* Maritime Header Wave */}
      <div className="relative bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-700 border-b-4 border-cyan-500 overflow-hidden">
        {/* Wave Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,60 350,0 600,50 C850,100 1050,40 1200,60 L1200,120 L0,120 Z" fill="currentColor" className="text-white"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Anchor className="h-6 w-6" />
              <span className="text-sm md:text-base font-bold tracking-wide">PORTAL MARITIM NUSANTARA</span>
            </div>
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen Hero - Ocean Voyage Style */}
      <section className="grid grid-cols-1 lg:grid-cols-2 h-[600px] border-b-4 border-cyan-200">
        {/* Port Side - Main Featured */}
        {isLoading ? (
          <div className="relative overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ) : featuredArticles[0] ? (
          <Link href={`/${channel?.id}/article/${featuredArticles[0].slug}`}>
            <div className="relative overflow-hidden group cursor-pointer h-full border-r-4 border-cyan-300">
              <img
                src={featuredArticles[0].image}
                alt={featuredArticles[0].imageAlt || featuredArticles[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/95 via-blue-900/60 to-transparent" />

              {/* Captain's Badge */}
              <div className="absolute top-6 left-6">
                <div className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg shadow-2xl border-2 border-cyan-400">
                  <div className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    <span className="font-bold text-sm tracking-wider">HEADLINE UTAMA</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <Badge className="mb-4 bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg text-sm px-4 py-1.5">
                  {featuredArticles[0].category}
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 line-clamp-3 leading-tight group-hover:text-cyan-300 transition-colors">
                  {featuredArticles[0].title}
                </h2>
                <div className="h-1 w-24 bg-cyan-400 mb-4"></div>
                <p className="text-lg md:text-xl opacity-90 line-clamp-2 mb-6 leading-relaxed">
                  {featuredArticles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-cyan-200 border-t border-cyan-700 pt-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{featuredArticles[0].author}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(featuredArticles[0].publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        {/* Starboard Side - Stacked Articles */}
        <div className="grid grid-rows-2">
          {isLoading ? (
            <>
              <Skeleton className="w-full h-full border-b-4 border-cyan-200" />
              <Skeleton className="w-full h-full" />
            </>
          ) : (
            <>
              {featuredArticles[1] && (
                <Link href={`/${channel?.id}/article/${featuredArticles[1].slug}`}>
                  <div className="relative overflow-hidden group border-b-4 border-cyan-300 cursor-pointer h-full">
                    <img
                      src={featuredArticles[1].image}
                      alt={featuredArticles[1].imageAlt || featuredArticles[1].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-cyan-900/50 to-transparent" />

                    {/* Compass Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:rotate-180 transition-transform duration-700">
                        <Compass className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                      <Badge className="mb-3 bg-blue-600 text-white hover:bg-blue-700 shadow-lg text-xs">
                        {featuredArticles[1].category}
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-bold line-clamp-2 mb-3 leading-tight group-hover:text-cyan-300 transition-colors">
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
                  <div className="relative overflow-hidden group cursor-pointer h-full">
                    <img
                      src={featuredArticles[2].image}
                      alt={featuredArticles[2].imageAlt || featuredArticles[2].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-blue-900/50 to-transparent" />

                    {/* Navigation Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Navigation className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                      <Badge className="mb-3 bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg text-xs">
                        {featuredArticles[2].category}
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-bold line-clamp-2 mb-3 leading-tight group-hover:text-cyan-300 transition-colors">
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

      {/* Two Column Deck - Port & Starboard */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Port Deck (Left) */}
          <div className="border-r-4 border-cyan-200 pr-0 lg:pr-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Port Deck</h2>
                <p className="text-sm text-cyan-700">Berita Terkini dari Pelabuhan</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {portArticles.map((article, index) => (
                  <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                    <article className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-cyan-500 hover:border-blue-600">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={article.image}
                            alt={article.imageAlt || article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <Badge className="mb-2 bg-cyan-100 text-cyan-800 hover:bg-cyan-200 text-xs">
                            {article.category}
                          </Badge>
                          <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight group-hover:text-cyan-700 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Starboard Deck (Right) */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Starboard Deck</h2>
                <p className="text-sm text-blue-700">Liputan Laut Nusantara</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {starboardArticles.map((article, index) => (
                  <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                    <article className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:border-cyan-600">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={article.image}
                            alt={article.imageAlt || article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                            {article.category}
                          </Badge>
                          <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wave Footer Decoration */}
      <div className="relative h-16 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 overflow-hidden">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,100 350,20 600,60 C850,100 1050,20 1200,60 L1200,0 L0,0 Z" fill="white" opacity="0.3"/>
          <path d="M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,0 L0,0 Z" fill="white" opacity="0.2"/>
        </svg>
      </div>
    </main>
  );
}
