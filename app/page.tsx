import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Heart, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import heroBanner from "@/assets/hero-banner.jpg";

async function getLatestArticles() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/articles`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.data.slice(0, 3) : [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

const Index = async () => {
  const latestArticles = await getLatestArticles();
  
  const features = [
    {
      icon: BookOpen,
      title: "Artikel Informatif",
      description: "Akses berbagai artikel tentang pengembangan diri, kesehatan mental, dan panduan karir."
    },
    {
      icon: Calendar,
      title: "Penjadwalan Mudah",
      description: "Pesan sesi konseling dengan konselor pilihan Anda sesuai keinginan Anda."
    },
    {
      icon: Heart,
      title: "Dukungan Kesehatan Mental",
      description: "Dapatkan bimbingan dan dukungan profesional untuk kesejahteraan mental dan emosional Anda."
    },
    {
      icon: Users,
      title: "Konselor Ahli",
      description: "Terhubung dengan konselor berpengalaman yang berdedikasi untuk membantu Anda sukses."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Selamat Datang di <span className="block">Sahabat BK</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
                Sahabat terpercaya Anda dalam bimbingan dan konseling. Kami di sini untuk mendukung pertumbuhan pribadi Anda, 
                kesehatan mental, dan perjalanan pengembangan karir melalui layanan konseling yang dapat diakses dan efektif.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={"/articles"}>
                  <Button size="lg" variant="secondary" className="gap-2">
                    <BookOpen className="h-5 w-5" />
                    Jelajahi Artikel
                  </Button>
                </Link>
                <Link href="/schedule">
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30">
                    <Calendar className="h-5 w-5" />
                    Jadwalkan Sesi
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-slide-up hidden md:block">
              <img 
                src={heroBanner.src} 
                alt="Bimbingan dan Konseling" 
                className="rounded-2xl shadow-elevated"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Misi Kami</h2>
            <p className="text-lg text-muted-foreground">
              Sahabat BK berdedikasi untuk menyediakan layanan bimbingan dan konseling yang komprehensif 
              yang memberdayakan siswa untuk mengatasi tantangan, menemukan potensi mereka, dan mencapai 
              tujuan mereka di lingkungan yang mendukung dan pengertian.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center transition-all duration-300 hover:shadow-elevated animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      {latestArticles.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Artikel Terbaru</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Baca artikel terbaru kami tentang pengembangan diri, kesehatan mental, dan panduan karir
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {latestArticles.map((article: any, index: number) => (
                <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
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

            <div className="text-center">
              <Link href="/articles">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lihat Semua Artikel
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap untuk Memulai?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Baik Anda memerlukan bimbingan tentang masalah pribadi, tantangan akademis, atau perencanaan karir, 
            kami di sini untuk membantu Anda di setiap langkah.
          </p>
          <Link href="/about">
            <Button size="lg" className="gap-2">
              Pelajari Lebih Lanjut Tentang Kami
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
