import { Switch, Route, useLocation } from "wouter";
import { Link } from "wouter";
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
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ContactPage from "@/pages/ContactPage";
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
      <Route path="/:channelId/about" component={AboutPage} />
      <Route path="/:channelId/privacy" component={PrivacyPage} />
      <Route path="/:channelId/contact" component={ContactPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function ChannelSelector() {
  const channels = Object.values(CHANNELS);

  // Channel icons/emojis untuk visual appeal
  const channelIcons: Record<string, string> = {
    ambal: "📰",
    beritaangin: "💨",
    dendelesinfo: "📡",
    beritadesa: "🏘️",
    kresnanusantara: "🌏",
    inforurutsewu: "📢",
    duniatengah: "🌍",
    voliinfo: "🏐",
    beritalaut: "⚓",
    berasbalap: "🏎️",
    cakranews: "📺",
    mjbnews: "💡"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full p-4 md:p-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-white/90 text-sm font-medium">Portal Berita Multi-Channel</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Pilih Portal <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">Berita</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Jelajahi berita terkini dari berbagai channel pilihan kami
          </p>
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {channels.map((channel, index) => {
            // Convert HSL string to CSS variable
            const hslColor = channel.primaryColor;

            return (
              <Link
                key={channel.id}
                href={`/${channel.id}`}
                className="group relative block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/50 overflow-hidden group-hover:scale-105 group-hover:-translate-y-1 h-full">
                  {/* Gradient Overlay on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ background: `hsl(${hslColor})` }}
                  />

                  {/* Icon */}
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {channelIcons[channel.id] || "📌"}
                  </div>

                  {/* Channel Name */}
                  <h3
                    className="text-xl md:text-2xl font-bold mb-2 transition-colors duration-300"
                    style={{ color: `hsl(${hslColor})` }}
                  >
                    {channel.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {channel.tagline}
                  </p>

                  {/* Colored Bottom Border */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: `hsl(${hslColor})` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12">
          <p className="text-white/80 text-sm">
            Powered by News Portal Platform • {channels.length} Channel Tersedia
          </p>
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
      
      console.log('App.tsx - Detecting channel from path:', path);
      
      // Detect channel from path (e.g., /ambal, /beritaangin, etc.)
      if (path !== '/' && path !== '') {
        // Extract channel ID from path
        const pathParts = path.split('/').filter(Boolean);
        const channelId = pathParts[0];
        
        console.log('App.tsx - Path parts:', pathParts, 'Channel ID:', channelId);
        
        if (channelId && CHANNELS[channelId]) {
          detectedChannel = CHANNELS[channelId];
          console.log('App.tsx - Detected channel:', detectedChannel.id);
        } else {
          console.log('App.tsx - Channel not found for ID:', channelId);
        }
      } else {
        console.log('App.tsx - Root path, no channel detected');
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
