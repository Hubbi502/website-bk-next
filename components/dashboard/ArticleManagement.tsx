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
  pdfUrl?: string;
  pdfFileName?: string;
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
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "Mental Health",
    readTime: "5 min read",
    pdfUrl: "",
    pdfFileName: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipe file tidak valid. Hanya JPG, PNG, WEBP, dan GIF yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }

      // Validasi ukuran (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengupload gambar");
      }

      return data.data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload gambar",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (file.type !== "application/pdf") {
        toast({
          title: "Error",
          description: "Tipe file tidak valid. Hanya file PDF yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }

      // Validasi ukuran (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 10MB",
          variant: "destructive",
        });
        return;
      }

      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const uploadPdf = async (): Promise<{ url: string; fileName: string } | null> => {
    if (!pdfFile) return null;

    setIsUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengupload PDF");
      }

      return {
        url: data.data.url,
        fileName: data.data.fileName,
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload PDF",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleAddArticle = async () => {
    if (!articleForm.title || !articleForm.excerpt || !articleForm.content) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile && !articleForm.image) {
      toast({
        title: "Error",
        description: "Mohon pilih gambar artikel",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload gambar terlebih dahulu jika ada file baru
      let imageUrl = articleForm.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          throw new Error("Gagal mengupload gambar");
        }
        imageUrl = uploadedUrl;
      }

      // Upload PDF jika ada
      let pdfUrl = null;
      let pdfName = null;
      if (pdfFile) {
        const pdfData = await uploadPdf();
        if (pdfData) {
          pdfUrl = pdfData.url;
          pdfName = pdfData.fileName;
        }
      }

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: articleForm.title,
          excerpt: articleForm.excerpt,
          content: articleForm.content,
          image: imageUrl,
          category: articleForm.category,
          readTime: articleForm.readTime,
          pdfUrl: pdfUrl,
          pdfFileName: pdfName,
          authorId: adminData?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menambah artikel");
      }

      await loadArticles();
      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read", pdfUrl: "", pdfFileName: "" });
      setImageFile(null);
      setImagePreview("");
      setPdfFile(null);
      setPdfFileName("");
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
      readTime: article.readTime || "5 min read",
      pdfUrl: article.pdfUrl || "",
      pdfFileName: article.pdfFileName || ""
    });
    setImagePreview(article.image);
    setImageFile(null);
    setPdfFile(null);
    setPdfFileName(article.pdfFileName || "");
    setIsAddArticleOpen(true);
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    setIsLoading(true);
    try {
      // Upload gambar baru jika ada file baru
      let imageUrl = articleForm.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          throw new Error("Gagal mengupload gambar");
        }
        imageUrl = uploadedUrl;
      }

      // Upload PDF baru jika ada file baru
      let pdfUrl = articleForm.pdfUrl;
      let pdfName = articleForm.pdfFileName;
      if (pdfFile) {
        const pdfData = await uploadPdf();
        if (pdfData) {
          pdfUrl = pdfData.url;
          pdfName = pdfData.fileName;
        }
      }

      const response = await fetch(`/api/articles/${editingArticle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...articleForm,
          image: imageUrl,
          pdfUrl: pdfUrl,
          pdfFileName: pdfName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui artikel");
      }

      await loadArticles();
      setEditingArticle(null);
      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read", pdfUrl: "", pdfFileName: "" });
      setImageFile(null);
      setImagePreview("");
      setPdfFile(null);
      setPdfFileName("");
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
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
            <div>
              <CardTitle className="text-base sm:text-xl">Daftar Artikel</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Kelola artikel bimbingan dan konseling
              </CardDescription>
            </div>
            <Dialog open={isAddArticleOpen} onOpenChange={setIsAddArticleOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full xs:w-auto text-xs sm:text-sm"
                  onClick={() => {
                  setEditingArticle(null);
                  setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read", pdfUrl: "", pdfFileName: "" });
                  setImageFile(null);
                  setImagePreview("");
                  setPdfFile(null);
                  setPdfFileName("");
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Artikel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col bg-gray-50">
                <DialogHeader className="border-b pb-4  sticky top-0 z-10 px-6 pt-4">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    {editingArticle ? (
                      <>
                        <Pencil className="h-5 w-5 text-sky-500" />
                        Edit Artikel
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 text-emerald-500" />
                        Tambah Artikel Baru
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-500">
                    {editingArticle ? "Perbarui informasi artikel yang sudah ada" : "Lengkapi form di bawah untuk membuat artikel baru"}
                  </DialogDescription>
                </DialogHeader>
                
                 <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    {/* Left Column */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-800">Konten Utama</CardTitle>
                          <CardDescription>Tulis judul, ringkasan, dan isi konten artikel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Judul Artikel
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="title"
                              placeholder="Contoh: Tips Mengatasi Stres Sebelum Ujian"
                              value={articleForm.title}
                              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                              className="text-base h-11 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                            <p className="text-xs text-gray-500">Buat judul yang jelas dan menarik perhatian pembaca</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="excerpt" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Ringkasan Singkat
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="excerpt"
                              placeholder="Ringkasan artikel yang akan ditampilkan di halaman utama (maks. 200 karakter)"
                              value={articleForm.excerpt}
                              onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                              rows={3}
                              className="resize-none text-gray-900 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">Tulis ringkasan yang informatif dan menarik</p>
                              <span className="text-xs text-gray-400">{articleForm.excerpt.length} karakter</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Konten Lengkap
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="content"
                              placeholder="Tulis konten artikel secara lengkap dan detail di sini..."
                              value={articleForm.content}
                              onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                              rows={12}
                              className="resize-none font-mono text-sm text-gray-900 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">Gunakan paragraf yang jelas dan mudah dipahami</p>
                              <span className="text-xs text-gray-400">{articleForm.content.length} karakter</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-1 space-y-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-800">Metadata</CardTitle>
                          <CardDescription>Atur kategori dan estimasi waktu baca.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Kategori
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={articleForm.category}
                              onValueChange={(value) => setArticleForm({ ...articleForm, category: value })}
                            >
                              <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mental Health">🧠 Mental Health</SelectItem>
                                <SelectItem value="Career Guidance">💼 Career Guidance</SelectItem>
                                <SelectItem value="Academic">📚 Academic</SelectItem>
                                <SelectItem value="Personal Growth">🌱 Personal Growth</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="readTime" className="text-sm font-semibold text-gray-700">
                              Estimasi Waktu Baca
                            </Label>
                            <Select
                              value={articleForm.readTime}
                              onValueChange={(value) => setArticleForm({ ...articleForm, readTime: value })}
                            >
                              <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Pilih waktu baca" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3 min read">⚡ 3 menit</SelectItem>
                                <SelectItem value="5 min read">📖 5 menit</SelectItem>
                                <SelectItem value="7 min read">📘 7 menit</SelectItem>
                                <SelectItem value="10 min read">📕 10 menit</SelectItem>
                                <SelectItem value="15 min read">📗 15 menit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-800">Gambar Artikel</CardTitle>
                          <CardDescription>Upload gambar untuk thumbnail artikel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Upload Gambar
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-3">
                              <Input
                                id="image"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                onChange={handleImageChange}
                                disabled={isLoading || isUploading}
                                className="h-11 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white cursor-pointer"
                              />
                              <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP, GIF (Max: 5MB)</p>
                              {isUploading && (
                                <div className="flex items-center gap-2 text-sm text-sky-600">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Mengupload gambar...
                                </div>
                              )}
                              {imagePreview && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                                  <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-40 object-cover"
                                  />
                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100">
                                    <p className="text-xs text-gray-500">Preview Gambar</p>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setImageFile(null);
                                        setImagePreview("");
                                        setArticleForm({ ...articleForm, image: "" });
                                      }}
                                      className="h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="text-gray-800">File PDF (Opsional)</CardTitle>
                          <CardDescription>Upload file PDF sebagai lampiran artikel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label htmlFor="pdf" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                              Upload PDF
                            </Label>
                            <div className="space-y-3">
                              <Input
                                id="pdf"
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfChange}
                                disabled={isLoading || isUploadingPdf}
                                className="h-11 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white cursor-pointer"
                              />
                              <p className="text-xs text-gray-500">Format: PDF (Max: 10MB)</p>
                              {isUploadingPdf && (
                                <div className="flex items-center gap-2 text-sm text-sky-600">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Mengupload PDF...
                                </div>
                              )}
                              {(pdfFileName || articleForm.pdfFileName) && (
                                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50">
                                  <div className="flex items-center justify-between py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                      </svg>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">{pdfFileName || articleForm.pdfFileName}</p>
                                        <p className="text-xs text-gray-500">File PDF terlampir</p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setPdfFile(null);
                                        setPdfFileName("");
                                        setArticleForm({ ...articleForm, pdfUrl: "", pdfFileName: "" });
                                      }}
                                      className="h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="border-t pt-4 pb-4 pr-6 pl-6 gap-2 bg-white sticky bottom-0 z-10">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddArticleOpen(false);
                      setEditingArticle(null);
                      setArticleForm({ title: "", excerpt: "", content: "", image: "", category: "Mental Health", readTime: "5 min read", pdfUrl: "", pdfFileName: "" });
                      setImageFile(null);
                      setImagePreview("");
                      setPdfFile(null);
                      setPdfFileName("");
                    }}
                    disabled={isLoading || isUploading}
                    className="h-11 px-6"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={editingArticle ? handleUpdateArticle : handleAddArticle}
                    disabled={isLoading || isUploading || !articleForm.title || !articleForm.excerpt || !articleForm.content || (!imageFile && !imagePreview)}
                    className={`h-11 px-8 text-white ${
                      editingArticle 
                        ? "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600" 
                        : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                    }`}
                  >
                    {(isLoading || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingArticle ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Perbarui Artikel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Publikasikan Artikel
                      </>
                    )}
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
                <div key={article.id} className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-lg leading-snug">{article.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{article.author}</span>
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    </div>
                  </div>
                  <div className="flex sm:flex-col flex-row gap-2 sm:items-end">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white flex-1 sm:flex-none"
                      onClick={() => handleEditArticle(article)}
                    >
                      <Pencil className="h-4 w-4 sm:mr-0" />
                      <span className="sm:hidden ml-1">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      <Trash2 className="h-4 w-4 sm:mr-0" />
                      <span className="sm:hidden ml-1">Hapus</span>
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
