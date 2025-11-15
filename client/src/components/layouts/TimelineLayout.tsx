import { Article } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import { useChannel } from "@/lib/channel-context";

interface TimelineLayoutProps {
  articles?: Omit<Article, 'content'>[];
  isLoading: boolean;
}

export function TimelineLayout({ articles, isLoading }: TimelineLayoutProps) {
  const { channel } = useChannel();
  const featuredArticle = articles?.find(a => a.featured);
  const timelineArticles = articles?.filter(a => !a.featured) || [];

  // Group articles by date
  const groupedByDate = timelineArticles.reduce((acc, article) => {
    const date = new Date(article.publishedAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(article);
    return acc;
  }, {} as Record<string, typeof timelineArticles>);

  return (
    <main className="flex-1 bg-background">
      {/* Featured Top */}
      {featuredArticle && (
        <section className="border-b bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="w-full h-96 rounded-lg" />
              </div>
            ) : (
              <Link href={`/${channel?.id}/article/${featuredArticle.slug}`}>
                <article className="cursor-pointer hover:opacity-90 transition-opacity">
                  <Badge variant="default" className="mb-4">
                    {featuredArticle.category}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {featuredArticle.title}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.imageAlt || featuredArticle.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <span className="font-medium">{featuredArticle.author}</span>
                    <span>•</span>
                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </article>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Timeline Feed */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-3 mb-12">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Timeline Berita</h2>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <div className="flex-shrink-0 w-32">
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="flex-1 space-y-4 pb-12 border-l-2 pl-8">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="w-full h-48 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {Object.entries(groupedByDate).map(([date, articles], dateIndex) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-8 mb-8">
                  <div className="flex-shrink-0 w-32">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-center">
                      {date.split(' ')[0]}<br/>
                      <span className="text-xs font-normal">{date.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Articles for this date */}
                {articles.map((article, index) => {
                  const isLast = dateIndex === Object.entries(groupedByDate).length - 1 &&
                                 index === articles.length - 1;

                  return (
                    <Link key={article.slug} href={`/${channel?.id}/article/${article.slug}`}>
                      <article
                        className={`flex gap-8 group hover-elevate rounded-lg p-4 -ml-4 cursor-pointer ${
                          !isLast ? 'mb-8' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 w-32 text-right">
                          <div className="text-sm font-medium text-muted-foreground">
                            {new Date(article.publishedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        <div className={`flex-1 ${!isLast ? 'border-l-2 border-primary/30' : ''} pl-8 ${!isLast ? 'pb-8' : ''}`}>
                          <div className="relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                            <Badge variant="outline" className="mb-3">
                              {article.category}
                            </Badge>

                            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>

                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {article.excerpt}
                            </p>

                            <img
                              src={article.image}
                              alt={article.imageAlt || article.title}
                              className="w-full aspect-video object-cover rounded-lg mb-4"
                            />

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-medium">{article.author}</span>
                              {article.tags && article.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex gap-2">
                                    {article.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
