import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Article } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannel } from "@/lib/channel-context";
import { SEO } from "@/components/SEO";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [, params] = useRoute("/:channelId/search");
  const { channel } = useChannel();

  // Get search query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q") || "";

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: [`/api/channels/${channel?.id}/search`, searchQuery],
    queryFn: async () => {
      if (!searchQuery || !channel) return [];
      const response = await fetch(
        `/api/channels/${channel.id}/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: !!searchQuery && !!channel,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`Pencarian: ${searchQuery}`}
        description={`Hasil pencarian untuk "${searchQuery}"`}
      />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <SearchIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Hasil Pencarian</h1>
          </div>
          {searchQuery ? (
            <p className="text-lg text-muted-foreground">
              Menampilkan hasil untuk:{" "}
              <span className="font-semibold text-foreground">"{searchQuery}"</span>
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Masukkan kata kunci pencarian
            </p>
          )}
        </div>

        {!searchQuery ? (
          <div className="text-center py-16 bg-gradient-to-b from-background to-muted/20 rounded-lg">
            <div className="max-w-md mx-auto px-4">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Cari Berita</h2>
              <p className="text-muted-foreground mb-6">
                Gunakan kotak pencarian di bagian atas untuk mencari berita yang Anda inginkan.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Ditemukan <span className="font-semibold text-foreground">{articles.length}</span> artikel
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-gradient-to-b from-background to-muted/20 rounded-lg">
            <div className="max-w-md mx-auto px-4">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-2">Tidak Ada Hasil</h2>
              <p className="text-muted-foreground mb-6">
                Tidak ditemukan artikel yang cocok dengan pencarian "{searchQuery}".
                Coba gunakan kata kunci yang berbeda.
              </p>
              <Link href={`/${channel?.id}`}>
                <span className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  ← Kembali ke Beranda
                </span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
