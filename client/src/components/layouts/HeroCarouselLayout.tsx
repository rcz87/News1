import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroCarouselLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function HeroCarouselLayout({ articles, isLoading }: HeroCarouselLayoutProps) {
  const heroArticles = articles?.slice(0, 5) || [];
  const gridArticles = articles?.slice(5, 11) || [];
  const listArticles = articles?.slice(11) || [];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (heroArticles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroArticles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
  };

  return (
    <main className="flex-1">
      {/* Hero Carousel */}
      <section className="relative w-full h-[600px] overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            {/* Slides */}
            {heroArticles.map((article, index) => (
              <div
                key={article.slug}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
                  <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                    {article.category}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
                    {article.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/80">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroArticles.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Berita Pilihan</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* List Section */}
      {listArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Artikel Lainnya</h2>
          <div className="space-y-4">
            {listArticles.slice(0, 5).map((article) => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
