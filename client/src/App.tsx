import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChannelProvider } from "@/lib/channel-context";
import { AuthProvider } from "@/lib/auth-context";
import { getChannelByPath, CHANNELS } from "@shared/channels";
import { useEffect, useState } from "react";
import { ChannelConfig } from "@shared/schema";
import HomePage from "@/pages/HomePage";
import ArticlePage from "@/pages/ArticlePage";
import CategoryPage from "@/pages/CategoryPage";
import SearchPage from "@/pages/SearchPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ArticleList from "@/pages/admin/ArticleList";
import ArticleEditor from "@/pages/admin/ArticleEditor";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import NotFound from "@/pages/not-found";

function Router({ channel }: { channel: ChannelConfig | null }) {
  return (
    <Switch>
      {/* Root homepage - show channel selector */}
      <Route path="/" component={() => <ChannelSelector />} />

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/articles" component={() => (
        <ProtectedRoute>
          <ArticleList />
        </ProtectedRoute>
      )} />
      <Route path="/admin/articles/new" component={() => (
        <ProtectedRoute>
          <ArticleEditor />
        </ProtectedRoute>
      )} />
      <Route path="/admin/articles/:slug/edit" component={() => (
        <ProtectedRoute>
          <ArticleEditor />
        </ProtectedRoute>
      )} />

      {/* Channel routes - path-based */}
      <Route path="/:channelId" component={HomePage} />
      <Route path="/:channelId/article/:slug" component={ArticlePage} />
      <Route path="/:channelId/category/:category" component={CategoryPage} />
      <Route path="/:channelId/search" component={SearchPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function ChannelSelector() {
  const channels = Object.values(CHANNELS);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl w-full p-8">
        <h1 className="text-4xl font-bold text-center mb-4">Pilih Portal Berita</h1>
        <p className="text-center text-muted-foreground mb-8">
          Pilih salah satu channel berita untuk mulai membaca
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={`/${channel.id}`}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200"
            >
              <h3 className="text-xl font-semibold mb-2">{channel.name}</h3>
              <p className="text-sm text-muted-foreground">{channel.tagline}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const [channel, setChannel] = useState<ChannelConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectChannel = () => {
      const path = location;
      let detectedChannel: ChannelConfig | null = null;
      
      // Detect channel from path (e.g., /ambal, /beritaangin, etc.)
      if (path !== '/' && path !== '') {
        detectedChannel = getChannelByPath(path);
      }
      
      setChannel(detectedChannel);
      setLoading(false);
    };

    detectChannel();
  }, [location]);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChannelProvider initialChannel={channel}>
            {channel && (
              <style>{`
                :root {
                  --primary: ${channel.primaryColor};
                  --chart-1: ${channel.primaryColor};
                  --sidebar-primary: ${channel.primaryColor};
                }
              `}</style>
            )}
            <Router channel={channel} />
            <Toaster />
          </ChannelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
