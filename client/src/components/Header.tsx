import { Link } from "wouter";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useChannel } from "@/lib/channel-context";
import { getAllChannels } from "@shared/channels";

export function Header() {
  const { channel } = useChannel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const allChannels = getAllChannels();

  if (!channel) return null;

  const categories = ["Politik", "Ekonomi", "Olahraga", "Teknologi", "Lifestyle"];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 md:px-6 h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex flex-col hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2" data-testid="link-home">
              <span className="text-xl md:text-2xl font-bold text-foreground">
                {channel.name}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {channel.tagline}
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                <a 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md"
                  data-testid={`link-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              data-testid="button-search-toggle"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Channel Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex" data-testid="button-channel-switcher">
                  Kanal Lainnya
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {allChannels.map((ch) => (
                  <DropdownMenuItem key={ch.id} asChild>
                    <a 
                      href={`http://${ch.subdomain}.localhost:5000`}
                      className="cursor-pointer"
                      data-testid={`link-channel-${ch.id}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{ch.name}</span>
                        <span className="text-xs text-muted-foreground">{ch.tagline}</span>
                      </div>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="px-4 md:px-6 pb-4 border-t">
            <div className="max-w-2xl mx-auto pt-4">
              <Input
                type="search"
                placeholder="Cari berita..."
                className="w-full"
                data-testid="input-search"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-2">
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                <a 
                  className="block px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover-elevate rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </a>
              </Link>
            ))}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground px-3 py-2">Kanal Lainnya</p>
              {allChannels.map((ch) => (
                <a
                  key={ch.id}
                  href={`http://${ch.subdomain}.localhost:5000`}
                  className="block px-3 py-2 text-sm hover-elevate rounded-md"
                  data-testid={`link-mobile-channel-${ch.id}`}
                >
                  <div className="font-medium">{ch.name}</div>
                  <div className="text-xs text-muted-foreground">{ch.tagline}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
