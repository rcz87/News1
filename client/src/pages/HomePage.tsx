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
