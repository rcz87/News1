import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Article } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlePage() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['/api/articles', slug],
    enabled: !!slug,
  });

  const { data: relatedArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles/related', article?.category],
    enabled: !!article,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-8 w-full">
          <Skeleton className="w-full aspect-[21/9] rounded-md mb-8" />
          <Skeleton className="h-8 w-20 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Artikel yang Anda cari tidak tersedia.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Article Header */}
        <div className="relative w-full aspect-[21/9] bg-muted overflow-hidden">
          <img 
            src={article.image} 
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 md:px-6 pb-12">
            <Badge className="mb-4" data-testid={`badge-category-${article.category}`}>
              {article.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4"
            data-testid="button-share"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-4 md:px-6 py-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-8">
              {article.excerpt}
            </p>
            <div 
              className="space-y-4 text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
              data-testid="article-content"
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" data-testid={`tag-${tag}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Artikel Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
