import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChannelProvider } from "@/lib/channel-context";
import { getChannelBySubdomain } from "@shared/channels";
import { useEffect, useState } from "react";
import { ChannelConfig } from "@shared/schema";
import HomePage from "@/pages/HomePage";
import ArticlePage from "@/pages/ArticlePage";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";

function Router({ channel }: { channel: ChannelConfig | null }) {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [channel, setChannel] = useState<ChannelConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectChannel = () => {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const subdomain = 'ambal';
        const detected = getChannelBySubdomain(subdomain);
        setChannel(detected);
      } else {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          const subdomain = parts[0];
          const detected = getChannelBySubdomain(subdomain);
          setChannel(detected);
        }
      }
      
      setLoading(false);
    };

    detectChannel();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat portal berita...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Channel Tidak Ditemukan</h1>
          <p className="text-muted-foreground">Subdomain yang Anda akses tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChannelProvider initialChannel={channel}>
          <style>{`
            :root {
              --primary: ${channel.primaryColor};
              --chart-1: ${channel.primaryColor};
              --sidebar-primary: ${channel.primaryColor};
            }
          `}</style>
          <Router channel={channel} />
          <Toaster />
        </ChannelProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
