import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useChannel } from "@/lib/channel-context";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";

export default function HomePage() {
  const { channel } = useChannel();

  const { data: articles, isLoading } = useQuery<Omit<Article, 'content'>[]>({
    queryKey: [`/api/channels/${channel?.id}/articles`],
    enabled: !!channel,
  });

  if (!channel) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Loading channel...</p>
    </div>;
  }

  const featuredArticle = articles?.find(a => a.featured);
  const topStories = articles?.filter(a => !a.featured).slice(0, 6) || [];
  const latestNews = articles?.slice(6, 10) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <Skeleton className="w-full h-[500px] md:h-[600px] rounded-md" />
          </div>
        ) : featuredArticle ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>
        ) : null}

        {/* Top Stories */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Berita Terkini</h2>
          </div>
          
          {isLoading ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topStories.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Latest News Sidebar */}
        {latestNews.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Berita Pilihan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {topStories.slice(0, 4).map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-8">Terbaru</h2>
                <div className="space-y-6">
                  {latestNews.map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
