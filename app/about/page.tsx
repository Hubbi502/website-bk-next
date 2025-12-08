import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Heart, Target, Users, Eye, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Empati",
      description: "Kami memberikan perhatian penuh dengan empati dan kepedulian terhadap kesejahteraan setiap siswa."
    },
    {
      icon: Target,
      title: "Keunggulan",
      description: "Kami memberikan bimbingan berkualitas tinggi untuk membantu siswa mencapai potensi terbaik mereka."
    },
    {
      icon: Users,
      title: "Keterbukaan",
      description: "Layanan konseling kami tersedia untuk semua siswa kapan saja mereka membutuhkan dukungan."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <section className="mb-16 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang Sahabat BK</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sahabat BK adalah platform digital terpercaya untuk layanan Bimbingan dan Konseling. Kami mendukung siswa dalam perjalanan akademis, pengembangan diri, dan menghadapi tantangan kehidupan.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Visi Card - Full Width with Accent */}
            <Card className="shadow-card mb-8 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Visi Bimbingan dan Konseling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base italic">
                  "Terwujudnya perkembangan individu secara optimal, individu yang mandiri, individu yang mampu beradaptasi dan berguna dalam masyarakat, serta terwujudnya kehidupan kemanusiaan yang bahagia melalui layanan bimbingan dan konseling."
                </p>
              </CardContent>
            </Card>

            {/* Misi Card - Full Width with Accent */}
            <Card className="shadow-card border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Misi Bimbingan dan Konseling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium mb-4">Misi BK SMK Negeri 1 Cibinong:</p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      Mendidik peserta didik melalui pengembangan perilaku efektif-normatif dalam kehidupan keseharian dan yang terkait masa depan melalui layanan bimbingan, baik itu kelompok ataupun klasikal dengan memperhatikan bidang pribadi, sosial, belajar, dan karier dengan beragam metode dan model bimbingan.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      Memfasilitasi perkembangan individu di dalam satuan pendidikan formal kea rah perkembangan optimal melalui strategi upaya pengembangan lingkungan belajar dan lingkungan lainnya serta kondisi tertentu sesuai dengan dinamika perkembangan masyarakat.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      Memantau dan memfasilitasi pengentasan masalah individu mengacu kepada kehidupan sehari-hari yang efektif melalui layanan konseling, baik konseling individu, kelompok, atau teman sebaya.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nilai Inti Kami</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="text-center shadow-card hover:shadow-elevated transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Layanan Kami</h2>
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Konseling Akademik:</strong> Bimbingan keterampilan belajar, pemilihan jurusan, dan perencanaan akademis
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Bimbingan Karier:</strong> Bantuan eksplorasi karier, perencanaan kuliah, dan persiapan masa depan
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Pengembangan Pribadi:</strong> Dukungan membangun kepercayaan diri, keterampilan sosial, dan ketahanan emosional
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Dukungan Kesehatan Mental:</strong> Bantuan mengelola stres, kecemasan, dan kesejahteraan emosional
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Perpustakaan Sumber Daya:</strong> Akses artikel, panduan, dan alat untuk pertumbuhan pribadi dan akademis
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Hubungi Kami</h2>
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Informasi Kontak</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">support@sahabatbk.edu</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Telepon</p>
                          <p className="text-muted-foreground">+62 (021) 1234-5678</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Jam Operasional</p>
                          <p className="text-muted-foreground">Senin - Jumat: 08.00 - 16.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Pesan Cepat</h3>
                    <p className="text-muted-foreground mb-4">
                      Ada pertanyaan atau butuh bantuan segera? Kami siap membantu Anda!
                    </p>
                    <Button className="w-full" size="lg">
                      <Mail className="h-4 w-4 mr-2" />
                      Kirim Pesan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
