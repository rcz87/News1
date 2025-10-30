import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface CardStackLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function CardStackLayout({ articles, isLoading }: CardStackLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stackArticles = articles?.slice(0, 5) || [];
  const gridArticles = articles?.slice(5) || [];

  return (
    <main className="flex-1 bg-gradient-to-br from-background to-muted/30">
      {/* Stacked Cards Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Berita Utama</h2>

        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="w-full max-w-4xl h-[500px] rounded-2xl" />
          </div>
        ) : (
          <div className="relative flex justify-center items-center" style={{ minHeight: '550px' }}>
            {/* Background Cards */}
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
                  <div className="bg-background rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />
                  </div>
                </div>
              );
            })}

            {/* Active Card */}
            {stackArticles[activeIndex] && (
              <article
                className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden hover-elevate"
                style={{ zIndex: 100 }}
              >
                <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image Side */}
                  <div className="relative h-64 md:h-auto">
                    <img
                      src={stackArticles[activeIndex].image}
                      alt={stackArticles[activeIndex].imageAlt || stackArticles[activeIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {stackArticles[activeIndex].category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {new Date(stackArticles[activeIndex].publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                        {stackArticles[activeIndex].title}
                      </h3>

                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        {stackArticles[activeIndex].excerpt}
                      </p>

                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {stackArticles[activeIndex].author[0]}
                        </div>
                        <div>
                          <div className="font-medium">{stackArticles[activeIndex].author}</div>
                          <div className="text-sm text-muted-foreground">Penulis</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveIndex((prev) => (prev + 1) % stackArticles.length)}
                      className="flex items-center gap-2 text-primary font-medium hover:gap-4 transition-all group"
                    >
                      <span>Berita Selanjutnya</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>
        )}

        {/* Navigation Dots */}
        {!isLoading && stackArticles.length > 0 && (
          <div className="flex justify-center gap-3 mt-12">
            {stackArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all ${
                  index === activeIndex
                    ? 'w-12 h-3 bg-primary rounded-full'
                    : 'w-3 h-3 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Artikel Lainnya</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="w-full h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article) => (
              <article
                key={article.slug}
                className="bg-background rounded-xl overflow-hidden shadow-lg hover-elevate group"
              >
                <div className="relative h-48">
                  <img
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge variant="secondary" className="absolute top-3 left-3">
                    {article.category}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    })}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
