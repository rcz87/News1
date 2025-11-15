import { useChannel } from "@/lib/channel-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { channel } = useChannel();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!channel) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Pesan terkirim!",
      description: "Terima kasih telah menghubungi kami. Kami akan merespons dalam 1-2 hari kerja.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <SEO
        title="Hubungi Kami"
        description={`Hubungi ${channel.name} untuk informasi, kritik, saran, atau kerja sama`}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            {/* Hero Section */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4 p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Hubungi Kami
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ada pertanyaan, kritik, saran, atau ingin bekerja sama dengan {channel.name}?
                Kami siap mendengar Anda!
              </p>
              <div className="h-1 w-20 bg-primary rounded-full mt-6 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Contact Info Cards */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a
                        href="mailto:kontak@wisanggeni.cloud"
                        className="text-sm text-primary hover:underline"
                      >
                        kontak@wisanggeni.cloud
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telepon</h3>
                      <a
                        href="tel:+62123456789"
                        className="text-sm text-primary hover:underline"
                      >
                        +62 123 456 789
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Alamat</h3>
                      <p className="text-sm text-muted-foreground">
                        Jakarta, Indonesia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Kirim Pesan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block">
                        Nama Lengkap <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Masukkan nama Anda"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                        Subjek <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="Topik pesan Anda"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="text-sm font-medium mb-2 block">
                        Pesan <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tulis pesan Anda di sini..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Jam Operasional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Senin - Jumat</span>
                      <span className="font-medium">09:00 - 17:00 WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sabtu</span>
                      <span className="font-medium">09:00 - 13:00 WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minggu</span>
                      <span className="font-medium text-destructive">Tutup</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary">Redaksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Untuk keperluan redaksi, liputan khusus, atau kerja sama media:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <a
                          href="mailto:redaksi@wisanggeni.cloud"
                          className="text-primary hover:underline font-medium"
                        >
                          redaksi@wisanggeni.cloud
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Media Sosial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ikuti kami untuk update berita terkini:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {channel.socialLinks?.facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={channel.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Facebook
                          </a>
                        </Button>
                      )}
                      {channel.socialLinks?.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={channel.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Twitter
                          </a>
                        </Button>
                      )}
                      {channel.socialLinks?.instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={channel.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Instagram
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
