import { ChannelConfig } from "./schema";

export const CHANNELS: Record<string, ChannelConfig> = {
  ambal: {
    id: "ambal",
    name: "Ambal News",
    subdomain: "ambal",
    tagline: "Berita Terpercaya dari Ambal",
    primaryColor: "210 85% 42%", // Blue
    secondaryColor: "190 75% 38%",
    description: "Portal berita terkini dan terpercaya dari wilayah Ambal dan sekitarnya",
    keywords: ["ambal", "berita lokal", "kebumen", "jawa tengah"],
    socialLinks: {
      twitter: "https://twitter.com/ambalnews",
      facebook: "https://facebook.com/ambalnews",
    },
  },
  puring: {
    id: "puring",
    name: "Puring Times",
    subdomain: "puring",
    tagline: "Suara Jakarta Selatan",
    primaryColor: "350 70% 48%", // Red
    secondaryColor: "30 80% 50%",
    description: "Informasi terkini dari kawasan Puring dan Jakarta Selatan",
    keywords: ["puring", "jakarta selatan", "berita metropolitan"],
    socialLinks: {
      twitter: "https://twitter.com/puringtimes",
      instagram: "https://instagram.com/puringtimes",
    },
  },
  kebayoran: {
    id: "kebayoran",
    name: "Kebayoran Post",
    subdomain: "kebayoran",
    tagline: "Jantung Informasi Kebayoran",
    primaryColor: "170 65% 35%", // Teal
    secondaryColor: "190 75% 38%",
    description: "Portal berita Kebayoran Baru dan sekitarnya",
    keywords: ["kebayoran", "jakarta", "berita lokal"],
    socialLinks: {
      facebook: "https://facebook.com/kebayoranpost",
    },
  },
  menteng: {
    id: "menteng",
    name: "Menteng Herald",
    subdomain: "menteng",
    tagline: "Berita Elite Jakarta Pusat",
    primaryColor: "30 80% 50%", // Orange
    secondaryColor: "350 70% 48%",
    description: "Berita eksklusif dari kawasan Menteng dan Jakarta Pusat",
    keywords: ["menteng", "jakarta pusat", "elite news"],
    socialLinks: {
      twitter: "https://twitter.com/mentengherald",
    },
  },
  senayan: {
    id: "senayan",
    name: "Senayan Daily",
    subdomain: "senayan",
    tagline: "Di Pusat Kehidupan Kota",
    primaryColor: "270 65% 45%", // Purple
    secondaryColor: "210 85% 42%",
    description: "Liputan lengkap dari kawasan Senayan dan sekitarnya",
    keywords: ["senayan", "jakarta", "olahraga", "politik"],
    socialLinks: {
      instagram: "https://instagram.com/senayandaily",
      facebook: "https://facebook.com/senayandaily",
    },
  },
  cipete: {
    id: "cipete",
    name: "Cipete News",
    subdomain: "cipete",
    tagline: "Berita Hangat Cipete Raya",
    primaryColor: "140 65% 42%", // Green
    secondaryColor: "170 65% 35%",
    description: "Informasi terbaru dari Cipete dan Jakarta Selatan",
    keywords: ["cipete", "jakarta selatan", "komunitas"],
    socialLinks: {
      twitter: "https://twitter.com/cipetenews",
    },
  },
  gandaria: {
    id: "gandaria",
    name: "Gandaria Express",
    subdomain: "gandaria",
    tagline: "Cepat, Akurat, Terpercaya",
    primaryColor: "200 85% 45%", // Light Blue
    secondaryColor: "190 75% 38%",
    description: "Berita tercepat dari kawasan Gandaria dan sekitarnya",
    keywords: ["gandaria", "jakarta selatan", "express news"],
    socialLinks: {
      facebook: "https://facebook.com/gandariaexpress",
      instagram: "https://instagram.com/gandariaexpress",
    },
  },
  pondok: {
    id: "pondok",
    name: "Pondok Chronicle",
    subdomain: "pondok",
    tagline: "Cerita dari Pondok Indah",
    primaryColor: "330 70% 50%", // Pink
    secondaryColor: "350 70% 48%",
    description: "Berita dan lifestyle dari Pondok Indah dan sekitarnya",
    keywords: ["pondok indah", "jakarta selatan", "lifestyle"],
    socialLinks: {
      instagram: "https://instagram.com/pondokchronicle",
    },
  },
  tebet: {
    id: "tebet",
    name: "Tebet Tribune",
    subdomain: "tebet",
    tagline: "Suara Masyarakat Tebet",
    primaryColor: "40 85% 50%", // Yellow-Orange
    secondaryColor: "30 80% 50%",
    description: "Portal berita Tebet dan Jakarta Selatan",
    keywords: ["tebet", "jakarta selatan", "komunitas"],
    socialLinks: {
      twitter: "https://twitter.com/tebettribune",
      facebook: "https://facebook.com/tebettribune",
    },
  },
  kuningan: {
    id: "kuningan",
    name: "Kuningan Insight",
    subdomain: "kuningan",
    tagline: "Perspektif Bisnis & Lifestyle",
    primaryColor: "190 75% 38%", // Cyan
    secondaryColor: "170 65% 35%",
    description: "Berita bisnis dan lifestyle dari kawasan Kuningan",
    keywords: ["kuningan", "jakarta selatan", "bisnis", "lifestyle"],
    socialLinks: {
      twitter: "https://twitter.com/kuninganinsight",
      instagram: "https://instagram.com/kuninganinsight",
    },
  },
};

export const getChannelBySubdomain = (subdomain: string): ChannelConfig | null => {
  return CHANNELS[subdomain] || null;
};

export const getAllChannels = (): ChannelConfig[] => {
  return Object.values(CHANNELS);
};
