import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronRight, Flag, Zap, Trophy, Timer, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface CardStackLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function CardStackLayout({ articles, isLoading }: CardStackLayoutProps) {
  const { channel } = useChannel();
  const [activeIndex, setActiveIndex] = useState(0);
  const stackArticles = articles?.slice(0, 5) || [];
  const gridArticles = articles?.slice(5) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900">
      {/* Racing Header - Checkered Flag Pattern */}
      <div className="relative bg-gradient-to-r from-red-600 via-black to-red-600 border-b-4 border-yellow-500 overflow-hidden">
        {/* Speed Lines Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_48%,rgba(255,255,255,0.1)_48%,rgba(255,255,255,0.1)_52%,transparent_52%,transparent_100%)] bg-[length:40px_40px] animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-yellow-500" />
              <span className="text-sm md:text-base font-black tracking-wider">RACING NEWS PORTAL</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
              <span className="text-xs font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </div>
      {/* Stacked Cards Hero - Racing Pit Stop Style */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-600 rounded-lg shadow-xl mb-4">
            <Trophy className="h-6 w-6 text-white" />
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">POLE POSITION</h2>
          </div>
          <p className="text-slate-400 text-sm">Berita Terdepan di Lintasan</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="w-full max-w-4xl h-[500px] rounded-2xl" />
          </div>
        ) : (
          <div className="relative flex justify-center items-center" style={{ minHeight: '550px' }}>
            {/* Background Cards - Stacked Layers */}
            {stackArticles.slice(0, 3).map((_, index) => {
              const offset = (index - activeIndex) * 20;
              const scale = 1 - Math.abs(index - activeIndex) * 0.05;
              const opacity = 1 - Math.abs(index - activeIndex) * 0.3;
              const zIndex = stackArticles.length - Math.abs(index - activeIndex);

              return (
                <div
                  key={index}
                  className="absolute w-full max-w-4xl transition-all duration-500 ease-out"
                  style={{
                    transform: `translateY(${offset}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30">
                    <div className="h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />
                  </div>
                </div>
              );
            })}

            {/* Active Card - Racing Podium */}
            {stackArticles[activeIndex] && (
              <Link href={`/${channel?.id}/article/${stackArticles[activeIndex].slug}`}>
                <article
                  key={activeIndex}
                  className="relative w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden hover:shadow-red-600/50 transition-all duration-300 cursor-pointer border-4 border-red-600"
                  style={{ zIndex: 100 }}
                >
                  {/* Racing Stripe */}
                  <div className="h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Side */}
                    <div className="relative h-64 md:h-auto">
                      <img
                        src={stackArticles[activeIndex].image}
                        alt={stackArticles[activeIndex].imageAlt || stackArticles[activeIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Racing Number Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="w-16 h-16 bg-red-600 border-4 border-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                          <span className="text-3xl font-black text-white">{activeIndex + 1}</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 font-black text-sm px-4 py-2 shadow-lg">
                          {stackArticles[activeIndex].category}
                        </Badge>
                      </div>

                      {/* Speed Lines Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-red-600/80 to-transparent backdrop-blur-sm flex items-center px-6">
                        <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-white font-bold text-sm">HIGH SPEED NEWS</span>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-800 to-slate-900">
                      <div>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                            <span>{formatDate(stackArticles[activeIndex].publishedAt)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Timer className="h-4 w-4 text-yellow-500" />
                            <span>5 min baca</span>
                          </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight text-white">
                          {stackArticles[activeIndex].title}
                        </h3>

                        <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-yellow-500 mb-6"></div>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed line-clamp-3">
                          {stackArticles[activeIndex].excerpt}
                        </p>

                        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border-l-4 border-red-600">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-yellow-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
                            {stackArticles[activeIndex].author[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white">{stackArticles[activeIndex].author}</div>
                            <div className="text-xs text-yellow-500 font-semibold">REPORTER</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveIndex((prev) => (prev + 1) % stackArticles.length);
                        }}
                        className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-600 text-white font-black rounded-lg hover:from-red-700 hover:to-yellow-700 transition-all group shadow-lg"
                      >
                        <span>BERITA SELANJUTNYA</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            )}
          </div>
        )}

        {/* Racing Position Indicators */}
        {!isLoading && stackArticles.length > 0 && (
          <div className="flex justify-center gap-3 mt-12">
            {stackArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all ${
                  index === activeIndex
                    ? 'w-14 h-4 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full shadow-lg'
                    : 'w-4 h-4 bg-slate-600 rounded-full hover:bg-slate-500 border-2 border-slate-500'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Grid Section - Race Track Lanes */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-lg flex items-center justify-center shadow-xl">
            <Flag className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">RACE TRACK</h2>
            <p className="text-slate-400 text-sm">Artikel Lainnya di Lintasan</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="w-full h-80 rounded-xl bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article, index) => (
              <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                <article className="group cursor-pointer h-full bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-600/30 transition-all duration-300 border-2 border-slate-700 hover:border-red-600">
                  {/* Racing Stripe Top */}
                  <div className="h-2 bg-gradient-to-r from-red-600 to-yellow-500" />

                  <div className="relative h-48">
                    <img
                      src={article.image}
                      alt={article.imageAlt || article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Position Number */}
                    <div className="absolute top-3 left-3">
                      <div className="w-10 h-10 bg-red-600 border-2 border-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-lg font-black text-white">{index + 1}</span>
                      </div>
                    </div>

                    {/* Category */}
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-black hover:bg-yellow-600 font-bold shadow-lg text-xs">
                      {article.category}
                    </Badge>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight text-white group-hover:text-yellow-500 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-3">
                      <span className="text-slate-500 truncate mr-2">{article.author}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Calendar className="h-3 w-3" />
                        <span className="font-semibold">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Speed indicator at bottom */}
                  <div className="h-1 bg-gradient-to-r from-red-600 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
