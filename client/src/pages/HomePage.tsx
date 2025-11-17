import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useChannel } from "@/lib/channel-context";
import { SEO } from "@/components/SEO";
import { MagazineLayout } from "@/components/layouts/MagazineLayout";
import { SportsPortalLayout } from "@/components/layouts/SportsPortalLayout";
import { MasonryGridLayout } from "@/components/layouts/MasonryGridLayout";
import { ModernMinimalistLayout } from "@/components/layouts/ModernMinimalistLayout";
import { GridNewsLayout } from "@/components/layouts/GridNewsLayout";
import { HeroCarouselLayout } from "@/components/layouts/HeroCarouselLayout";
import { SimpleHeroLayout } from "@/components/layouts/SimpleHeroLayout";
import { TimelineLayout } from "@/components/layouts/TimelineLayout";
import { SplitScreenLayout } from "@/components/layouts/SplitScreenLayout";
import { CardStackLayout } from "@/components/layouts/CardStackLayout";
import { FeaturedSidebarLayout } from "@/components/layouts/FeaturedSidebarLayout";

export default function HomePage() {
  const { channel } = useChannel();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: [`/channels/${channel?.id}/articles`],
    enabled: !!channel,
    refetchInterval: false, // Disable auto-refresh for better performance
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('HomePage Debug:', {
      channel: channel?.id,
      isLoading,
      articlesCount: articles.length,
      firstArticle: articles[0]?.title
    });
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Memuat channel...</p>
        </div>
      </div>
    );
  }

  // Render different layout based on channel's layoutType
  const renderLayout = () => {
    switch (channel.layoutType) {
      case "magazine":
        return <MagazineLayout articles={articles} isLoading={isLoading} />;
      case "sports":
        return <SportsPortalLayout articles={articles} isLoading={isLoading} />;
      case "masonry":
        return <MasonryGridLayout articles={articles} isLoading={isLoading} />;
      case "minimalist":
        return <ModernMinimalistLayout articles={articles} isLoading={isLoading} />;
      case "grid":
        return <GridNewsLayout articles={articles} isLoading={isLoading} />;
      case "carousel":
        // Use SimpleHeroLayout for debugging
        return <SimpleHeroLayout articles={articles} isLoading={isLoading} />;
      case "timeline":
        return <TimelineLayout articles={articles} isLoading={isLoading} />;
      case "splitscreen":
        return <SplitScreenLayout articles={articles} isLoading={isLoading} />;
      case "cardstack":
        return <CardStackLayout articles={articles} isLoading={isLoading} />;
      case "sidebar":
        return <FeaturedSidebarLayout articles={articles} isLoading={isLoading} />;
      default:
        return <MagazineLayout articles={articles} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Header />
      {renderLayout()}
      <Footer />
    </div>
  );
}
