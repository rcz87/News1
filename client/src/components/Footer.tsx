import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useChannel } from "@/lib/channel-context";
import { getAllChannels } from "@shared/channels";

export function Footer() {
  const { channel } = useChannel();
  const allChannels = getAllChannels();

  if (!channel) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">{channel.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {channel.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-4">Navigasi</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
                  data-testid="link-footer-about"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
                  data-testid="link-footer-contact"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
                  data-testid="link-footer-privacy"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* All Channels */}
          <div>
            <h3 className="font-bold text-sm mb-4">Kanal Berita</h3>
            <ul className="space-y-2">
              {allChannels.slice(0, 5).map((ch) => (
                <li key={ch.id}>
                  <a
                    href={`http://${ch.subdomain}.localhost:5000`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-channel-${ch.id}`}
                  >
                    {ch.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-sm mb-4">Ikuti Kami</h3>
            <div className="flex gap-3">
              {channel.socialLinks?.facebook && (
                <a
                  href={channel.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate active-elevate-2 p-2 rounded-md"
                  data-testid="link-social-facebook"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                </a>
              )}
              {channel.socialLinks?.twitter && (
                <a
                  href={channel.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate active-elevate-2 p-2 rounded-md"
                  data-testid="link-social-twitter"
                >
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                </a>
              )}
              {channel.socialLinks?.instagram && (
                <a
                  href={channel.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate active-elevate-2 p-2 rounded-md"
                  data-testid="link-social-instagram"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {channel.name}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
