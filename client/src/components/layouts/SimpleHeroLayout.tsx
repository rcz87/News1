import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle, Calendar, User, Flame } from "lucide-react";

interface SimpleHeroLayoutProps {
  articles?: Article[];
  isLoading: boolean;
}

export function SimpleHeroLayout({ articles, isLoading }: SimpleHeroLayoutProps) {
  const { channel } = useChannel();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroArticles = articles?.filter(a => a.featured).slice(0, 3) || articles?.slice(0, 3) || [];
  const gridArticles = articles?.filter(a => !heroArticles.includes(a)) || []; // Show all remaining articles

  // Auto-rotate slides
  useEffect(() => {
    if (heroArticles.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroArticles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <main className="flex-1">
        <Skeleton className="w-full h-[600px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full h-64" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <main className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tidak Ada Artikel</h1>
          <p>Belum ada artikel yang tersedia untuk channel ini.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Full-Screen Hero Carousel */}
      <div className="relative h-[500px] md:h-[700px] overflow-hidden bg-black">
        {/* Slides */}
        {heroArticles.map((article, index) => (
          <div
            key={article.slug}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex items-end pb-16 md:pb-24">
              <div className="max-w-3xl">
                {/* Breaking News Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg animate-pulse">
                    <Flame className="h-4 w-4 text-white" />
                    <span className="text-white font-bold text-sm">BREAKING</span>
                  </div>
                  <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
                    {article.category}
                  </Badge>
                </div>

                {/* Title */}
                <Link href={`/${channel?.id}/article/${article.slug}`}>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight cursor-pointer hover:text-primary transition-colors">
                    {article.title}
                  </h1>
                </Link>

                {/* Excerpt */}
                <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {heroArticles.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {heroArticles.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group p-1"
                aria-label={`Go to slide ${index + 1}`}
              >
                <Circle
                  className={`h-2 w-2 transition-all ${
                    index === currentSlide
                      ? 'fill-white text-white scale-125'
                      : 'fill-white/40 text-white/40 group-hover:fill-white/60'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Articles Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold">Berita Lainnya</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridArticles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/${channel?.id}/article/${article.slug}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <article className="group cursor-pointer h-full">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-xl mb-4 bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white text-xs shadow-lg">
                      {article.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div>
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
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
