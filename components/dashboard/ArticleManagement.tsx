"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleManagementProps {
  articles: Article[];
  loadArticles: () => void;
  adminData: any;
}

export function ArticleManagement({ articles, loadArticles, adminData }: ArticleManagementProps) {
  const { toast } = useToast();
  const [isAddArticleOpen, setIsAddArticleOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "Mental Health",
    readTime: "5 min read"
  });

  const handleAddArticle = async () => {
    if (!articleForm.title || !articleForm.excerpt || !articleForm.content) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: articleForm.title,
          excerpt: articleForm.excerpt,
          content: articleForm.content,
          image: articleForm.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
          category: articleForm.category,
          readTime: articleForm.readTime,
          authorId: adminData?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menambah artikel");
      }

      await loadArticles();
      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read" });
      setIsAddArticleOpen(false);

      toast({
        title: "Berhasil",
        description: "Artikel berhasil ditambahkan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambah artikel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image,
      category: article.category || "Mental Health",
      readTime: article.readTime || "5 min read"
    });
    setIsAddArticleOpen(true);
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/articles/${editingArticle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui artikel");
      }

      await loadArticles();
      setEditingArticle(null);
      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read" });
      setIsAddArticleOpen(false);

      toast({
        title: "Berhasil",
        description: "Artikel berhasil diperbarui",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui artikel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus artikel");
      }

      await loadArticles();
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus artikel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Artikel</CardTitle>
              <CardDescription>
                Kelola artikel bimbingan dan konseling
              </CardDescription>
            </div>
            <Dialog open={isAddArticleOpen} onOpenChange={setIsAddArticleOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingArticle(null);
                  setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read" });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Artikel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingArticle ? "Perbarui informasi artikel" : "Isi form untuk menambah artikel baru"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Artikel</Label>
                    <Input
                      id="title"
                      placeholder="Masukkan judul artikel"
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={articleForm.category}
                      onValueChange={(value) => setArticleForm({ ...articleForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mental Health">Mental Health</SelectItem>
                        <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Personal Growth">Personal Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readTime">Waktu Baca</Label>
                    <Select
                      value={articleForm.readTime}
                      onValueChange={(value) => setArticleForm({ ...articleForm, readTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih waktu baca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3 min read">3 min read</SelectItem>
                        <SelectItem value="5 min read">5 min read</SelectItem>
                        <SelectItem value="7 min read">7 min read</SelectItem>
                        <SelectItem value="10 min read">10 min read</SelectItem>
                        <SelectItem value="15 min read">15 min read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Ringkasan</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Ringkasan singkat artikel"
                      value={articleForm.excerpt}
                      onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Konten Artikel</Label>
                    <Textarea
                      id="content"
                      placeholder="Isi lengkap artikel"
                      value={articleForm.content}
                      onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL Gambar (opsional)</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={articleForm.image}
                      onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddArticleOpen(false);
                      setEditingArticle(null);
                      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read" });
                    }}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={editingArticle ? handleUpdateArticle : handleAddArticle}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingArticle ? "Perbarui" : "Tambah"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Belum ada artikel</p>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{article.title}</h3>
                    <p className="text-slate-600 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.author}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditArticle(article)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
