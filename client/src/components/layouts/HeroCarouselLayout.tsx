import { Article } from "@shared/schema";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroCarouselLayoutProps {
  articles?: Article[];
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
      <section className="relative w-full">
        {isLoading ? (
          <Skeleton className="w-full h-[400px] md:h-[600px]" />
        ) : (
          <div className="relative">
            {/* Slides */}
            {heroArticles.map((article, index) => (
              <div
                key={article.slug}
                className={`transition-all duration-1000 ${
                  index === currentSlide ? 'block' : 'hidden'
                }`}
              >
                <a
                  href={`/${article.channelId}/article/${article.slug}`}
                  className="block"
                >
                  {/* Title and metadata above image */}
                  <div className={`p-6 md:p-16 max-w-7xl mx-auto transition-all duration-700 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    <Badge variant="secondary" className="mb-4 text-lg px-4 py-2 animate-fade-in-down">
                      {article.category}
                    </Badge>
                    <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 max-w-4xl animate-fade-in-up hover:text-primary transition-colors" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                      {article.title}
                    </h1>
                    <p className="text-sm md:text-xl text-muted-foreground mb-4 md:mb-6 max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  
                  {/* Image below title */}
                  <div className="w-full h-[400px] md:h-[600px] overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.imageAlt || article.title}
                      className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                      style={{ objectPosition: 'center 25%' }}
                    />
                  </div>
                </a>
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
          </div>
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
