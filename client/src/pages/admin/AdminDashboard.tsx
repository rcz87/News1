import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Eye, PlusCircle, TrendingUp } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-context";
import { useChannel } from "@/lib/channel-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { channel } = useChannel();

  const { data: articles, isLoading } = useQuery({
    queryKey: [`/api/admin/articles`, channel?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/articles?channel=${channel?.id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    enabled: !!channel,
  });

  const stats = {
    total: articles?.length || 0,
    published: articles?.filter((a: any) => a.status === "published").length || 0,
    draft: articles?.filter((a: any) => a.status === "draft").length || 0,
    totalViews: articles?.reduce((sum: number, a: any) => sum + (a.viewCount || 0), 0) || 0,
  };

  const recentArticles = articles?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your content.
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats.total}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalViews.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Your latest content updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article: any) => (
                  <div
                    key={article.slug}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {article.status}
                        </span>
                        <span>•</span>
                        <span>{article.category}</span>
                        {article.viewCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.viewCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/admin/articles/${article.slug}/edit?channel=${channel?.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No articles yet. Create your first article!</p>
                <Link href="/admin/articles/new">
                  <Button className="mt-4">Create Article</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
