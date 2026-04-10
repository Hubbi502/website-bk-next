"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  pdfUrl?: string;
  pdfFileName?: string;
}

const ArticleDetailContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setArticle(data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Artikel yang Anda cari tidak ada.</p>
          <Link href="/articles">
            <Button>Kembali ke Artikel</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/articles">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Artikel
          </Button>
        </Link>

        <div className="animate-fade-in">
          <Badge className="mb-4">{article.category || "General"}</Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime || "5 min read"}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-8">Oleh {article.author}</p>

          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-[400px] object-cover rounded-xl shadow-elevated mb-8"
          />

          {article.pdfUrl && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">File PDF Tersedia</h3>
                    <p className="text-sm text-gray-600">{article.pdfFileName || "Dokumen terlampir"}</p>
                  </div>
                </div>
                <a 
                  href={article.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                >
                  <Button className="gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground">
            <p className="text-lg leading-relaxed whitespace-pre-line">{article.content}</p>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground mb-4">Butuh bimbingan personal?</p>
            <Link href="/schedule">
              <Button size="lg">Jadwalkan Sesi Konseling</Button>
            </Link>
          </div>

          {/* Comment Section */}
          <CommentSection articleId={id!} />
        </div>
      </article>
    </div>
  );
};

const ArticleDetail = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    }>
      <ArticleDetailContent />
    </Suspense>
  );
};

export default ArticleDetail;
