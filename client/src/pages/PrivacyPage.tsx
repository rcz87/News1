import { useChannel } from "@/lib/channel-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail } from "lucide-react";

export default function PrivacyPage() {
  const { channel } = useChannel();

  if (!channel) {
    return null;
  }

  // Get current date for last updated
  const lastUpdated = new Date().toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <SEO
        title="Kebijakan Privasi"
        description="Kebijakan Privasi dan perlindungan data pengguna di portal berita kami"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Hero Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Kebijakan Privasi
                </h1>
              </div>
              <p className="text-muted-foreground">
                Terakhir diperbarui: {lastUpdated}
              </p>
              <div className="h-1 w-20 bg-primary rounded-full mt-4"></div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Section 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Informasi yang kami kumpulkan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Kami dapat mengumpulkan data pribadi Anda seperti nama, alamat email, alamat IP, 
                    jenis perangkat/laptop, browser, waktu kunjungan, dan aktivitas pada situs.
                  </p>
                </CardContent>
              </Card>

              {/* Section 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Cara kami menggunakan data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Data digunakan untuk menjalankan dan meningkatkan layanan kami, mengirim pemberitahuan 
                    atau update, menganalisis trafik serta menyediakan fitur iklan atau konten yang relevan.
                  </p>
                </CardContent>
              </Card>

              {/* Section 3 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Teknologi pelacakan & Cookies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Situs ini menggunakan cookies atau teknologi serupa untuk menyimpan preferensi pengguna, 
                    mengautentikasi sesi, dan menganalisis data penggunaan. Anda dapat menonaktifkan cookies 
                    melalui pengaturan browser, namun beberapa fitur mungkin tidak berjalan dengan normal.
                  </p>
                </CardContent>
              </Card>

              {/* Section 4 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Keamanan data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Kami telah mengambil langkah teknis dan organisasi yang wajar untuk melindungi data Anda. 
                    Namun, tidak ada metode transmisi atau penyimpanan elektronik yang benar-benar aman.
                  </p>
                </CardContent>
              </Card>

              {/* Section 5 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <span>Tautan ke situs lain</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Situs kami mungkin menyertakan tautan ke situs pihak ketiga yang tidak kami kendalikan. 
                    Kami tidak bertanggung jawab atas praktik privasi pada situs tersebut.
                  </p>
                </CardContent>
              </Card>

              {/* Section 6 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">6.</span>
                    <span>Perubahan kebijakan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Kami berhak memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan diumumkan di situs.
                  </p>
                </CardContent>
              </Card>

              {/* Section 7 - Contact */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span className="text-primary font-bold">7.</span>
                    <span>Hubungi Kami</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Jika Anda memiliki pertanyaan terkait kebijakan ini, silakan hubungi:
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <Mail className="h-4 w-4" />
                    <a 
                      href="mailto:kontak@wisanggeni.cloud"
                      className="font-medium hover:underline"
                    >
                      kontak@wisanggeni.cloud
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
