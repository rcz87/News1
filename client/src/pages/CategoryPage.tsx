import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Article } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannel } from "@/lib/channel-context";
import { SEO } from "@/components/SEO";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category;
  const { channel } = useChannel();

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: [`/api/channels/${channel?.id}/categories/${category}/articles`],
    enabled: !!category && !!channel,
  });

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`Berita ${categoryName}`}
        description={`Berita terkini seputar ${categoryName.toLowerCase()}`}
      />
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryName}</h1>
          <p className="text-lg text-muted-foreground">
            Berita terkini seputar {categoryName.toLowerCase()}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-video rounded-md" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-b from-background to-muted/20 rounded-lg">
            <div className="max-w-md mx-auto px-4">
              <div className="text-6xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold mb-2">Dalam Pembaruan</h2>
              <p className="text-muted-foreground mb-6">
                Konten kategori {categoryName.toLowerCase()} sedang dalam proses pembaruan. 
                Silakan kembali lagi nanti untuk artikel terbaru.
              </p>
              <a href={`/${channel?.id}`} className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                ← Kembali ke Beranda
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
