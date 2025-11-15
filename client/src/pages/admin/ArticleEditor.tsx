import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, ArrowLeft } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-context";
import { useChannel } from "@/lib/channel-context";
import { useToast } from "@/hooks/use-toast";

export default function ArticleEditor() {
  const [, params] = useRoute("/admin/articles/:slug/edit");
  const [, setLocation] = useLocation();
  const { channel } = useChannel();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditMode = !!params?.slug;
  const slug = params?.slug;

  const urlParams = new URLSearchParams(window.location.search);
  const channelParam = urlParams.get("channel") || channel?.id;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Berita",
    author: "Admin",
    image: "",
    imageAlt: "",
    tags: [] as string[],
    featured: false,
    status: "draft" as "draft" | "published",
  });

  const [tagInput, setTagInput] = useState("");

  // Fetch existing article for edit mode
  const { data: existingArticle } = useQuery({
    queryKey: [`/api/admin/articles/${slug}`, channelParam],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/articles/${slug}?channel=${channelParam}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
    enabled: isEditMode && !!slug && !!channelParam,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingArticle) {
      setFormData({
        title: existingArticle.title || "",
        slug: existingArticle.slug || "",
        excerpt: existingArticle.excerpt || "",
        content: existingArticle.content || "",
        category: existingArticle.category || "Berita",
        author: existingArticle.author || "Admin",
        image: existingArticle.image || "",
        imageAlt: existingArticle.imageAlt || "",
        tags: existingArticle.tags || [],
        featured: existingArticle.featured || false,
        status: existingArticle.status || "draft",
      });
    }
  }, [existingArticle]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditMode && formData.title) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, isEditMode]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isEditMode
        ? `/api/admin/articles/${slug}?channel=${channelParam}`
        : `/api/admin/articles`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          channel: channelParam,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save article");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/articles`] });
      toast({
        title: isEditMode ? "Article updated" : "Article created",
        description: `The article has been successfully ${isEditMode ? "updated" : "created"}.`,
      });
      setLocation("/admin/articles");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/articles")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditMode ? "Edit Article" : "New Article"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode
                  ? "Update your article content"
                  : "Create a new article for your channel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}
              disabled={saveMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              onClick={() => setFormData((prev) => ({ ...prev, status: "published" }))}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>Write your article content below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter article title..."
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="article-url-slug"
                    disabled={isEditMode}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {isEditMode
                      ? "Slug cannot be changed after creation"
                      : "Auto-generated from title"}
                  </p>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Brief summary of the article..."
                    rows={3}
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <TipTapEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                    placeholder="Start writing your article..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Article</Label>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Politik">Politik</SelectItem>
                      <SelectItem value="Ekonomi">Ekonomi</SelectItem>
                      <SelectItem value="Olahraga">Olahraga</SelectItem>
                      <SelectItem value="Teknologi">Teknologi</SelectItem>
                      <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="Berita">Berita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a tag..."
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-secondary rounded-md"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, author: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>

                {formData.image && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-auto"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Image Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={formData.imageAlt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, imageAlt: e.target.value }))
                    }
                    placeholder="Describe the image..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
