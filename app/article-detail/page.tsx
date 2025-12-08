"use client";

import { useEffect, useState } from "react";
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
}

const ArticleDetail = () => {
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

export default ArticleDetail;
