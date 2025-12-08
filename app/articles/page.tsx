"use client"
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";

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
}

const Articles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load articles from database API
    const loadArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        const data = await response.json();
        
        if (data.success) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(articles.map(a => a.category).filter((cat): cat is string => Boolean(cat)))];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Articles & Resources</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of informative articles on personal growth, mental health, and career guidance
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredArticles.map((article, index) => (
              <div key={article.id} style={{ animationDelay: `${index * 50}ms` }}>
                <ArticleCard 
                  id={String(article.id)}
                  title={article.title}
                  description={article.excerpt}
                  category={article.category || "General"}
                  readTime={article.readTime || "5 min read"}
                  imageUrl={article.image}
                  date={article.date}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {articles.length === 0 
                ? "Belum ada artikel yang tersedia." 
                : "Tidak ada artikel yang sesuai dengan kriteria pencarian."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
