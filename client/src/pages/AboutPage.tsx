import { useChannel } from "@/lib/channel-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Globe } from "lucide-react";

export default function AboutPage() {
  const { channel } = useChannel();

  if (!channel) {
    return null;
  }

  // Default content for all channels
  const defaultAbout = {
    title: `Tentang ${channel.name}`,
    description: `Portal berita terkini dan terpercaya dari ${channel.name}. Kami berkomitmen untuk menyajikan berita yang akurat, objektif, dan relevan dengan kebutuhan masyarakat.`,
    established: "2025",
    network: "wisanggeni.cloud",
    email: "kontak@wisanggeni.cloud"
  };

  // Channel-specific content
  const channelAbout: Record<string, typeof defaultAbout> = {
    ambal: {
      title: "Tentang Ambal News",
      description: "Portal berita terkini dan terpercaya dari wilayah Ambal dan sekitarnya. Kami berkomitmen untuk menyajikan berita lokal yang akurat, objektif dan relevan dengan kebutuhan masyarakat.",
      established: "2025",
      network: "wisanggeni.cloud",
      email: "kontak@wisanggeni.cloud"
    }
  };

  const aboutData = channelAbout[channel.id] || defaultAbout;

  return (
    <>
      <SEO
        title="Tentang Kami"
        description={aboutData.description}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Hero Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {aboutData.title}
              </h1>
              <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
            </div>

            {/* Main Content */}
            <div className="space-y-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Visi & Misi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {aboutData.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Didirikan pada tahun {aboutData.established}, {channel.name} adalah bagian dari jaringan berita {aboutData.network}, yang didukung oleh tim redaksi profesional dan teknologi mutakhir.
                  </p>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Didirikan</p>
                        <p className="font-semibold">{aboutData.established}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Jaringan</p>
                        <p className="font-semibold">{aboutData.network}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${aboutData.email}`}
                          className="font-semibold hover:text-primary transition-colors text-sm break-all"
                        >
                          {aboutData.email}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Values Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Nilai-Nilai Kami</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Akurat</h3>
                      <p className="text-sm text-muted-foreground">
                        Kami berkomitmen menyajikan informasi yang faktual dan terverifikasi.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Objektif</h3>
                      <p className="text-sm text-muted-foreground">
                        Berita disajikan secara berimbang tanpa keberpihakan.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Relevan</h3>
                      <p className="text-sm text-muted-foreground">
                        Fokus pada berita yang bermanfaat bagi masyarakat.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Terpercaya</h3>
                      <p className="text-sm text-muted-foreground">
                        Menjaga integritas dan kredibilitas dalam setiap pemberitaan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hubungi Kami</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Untuk informasi lebih lanjut, kritik, saran, atau kerja sama, silakan hubungi kami:
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${aboutData.email}`}
                      className="font-medium hover:underline"
                    >
                      {aboutData.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
