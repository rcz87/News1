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
  beritaangin: {
    id: "beritaangin",
    name: "Berita Angin",
    subdomain: "beritaangin",
    tagline: "Kabar Dalam Angin",
    primaryColor: "350 70% 48%", // Red
    secondaryColor: "30 80% 50%",
    description: "Informasi terkini yang cepat tersebar seperti angin",
    keywords: ["berita angin", "kabar cepat", "informasi terkini"],
    socialLinks: {
      twitter: "https://twitter.com/beritaangin",
      instagram: "https://instagram.com/beritaangin",
    },
  },
  dendelesinfo: {
    id: "dendelesinfo",
    name: "Dendeles Info",
    subdomain: "dendelesinfo",
    tagline: "Informasi Terpercaya",
    primaryColor: "170 65% 35%", // Teal
    secondaryColor: "190 75% 38%",
    description: "Portal informasi dan berita terkini",
    keywords: ["dendeles", "informasi", "berita"],
    socialLinks: {
      facebook: "https://facebook.com/dendelesinfo",
    },
  },
  beritadesa: {
    id: "beritadesa",
    name: "Berita Desa",
    subdomain: "beritadesa",
    tagline: "Suara Pedesaan Indonesia",
    primaryColor: "30 80% 50%", // Orange
    secondaryColor: "350 70% 48%",
    description: "Berita dari desa untuk Indonesia",
    keywords: ["berita desa", "pedesaan", "Indonesia"],
    socialLinks: {
      twitter: "https://twitter.com/beritadesa",
    },
  },
  kresnanusantara: {
    id: "kresnanusantara",
    name: "Kresna Nusantara",
    subdomain: "kresnanusantara",
    tagline: "Warta Nusantara",
    primaryColor: "270 65% 45%", // Purple
    secondaryColor: "210 85% 42%",
    description: "Liputan lengkap dari seluruh nusantara",
    keywords: ["kresna", "nusantara", "Indonesia"],
    socialLinks: {
      instagram: "https://instagram.com/kresnanusantara",
      facebook: "https://facebook.com/kresnanusantara",
    },
  },
  inforurutsewu: {
    id: "inforurutsewu",
    name: "Info Urut Sewu",
    subdomain: "inforurutsewu",
    tagline: "Informasi Lengkap dan Terpercaya",
    primaryColor: "140 65% 42%", // Green
    secondaryColor: "170 65% 35%",
    description: "Informasi terkini dari berbagai sumber",
    keywords: ["urut sewu", "informasi", "berita"],
    socialLinks: {
      twitter: "https://twitter.com/inforurutsewu",
    },
  },
  duniatengah: {
    id: "duniatengah",
    name: "Dunia Tengah",
    subdomain: "duniatengah",
    tagline: "Berita dari Pusat Dunia",
    primaryColor: "200 85% 45%", // Light Blue
    secondaryColor: "190 75% 38%",
    description: "Berita internasional dan nasional",
    keywords: ["dunia tengah", "internasional", "berita dunia"],
    socialLinks: {
      facebook: "https://facebook.com/duniatengah",
      instagram: "https://instagram.com/duniatengah",
    },
  },
  voliinfo: {
    id: "voliinfo",
    name: "Voli Info",
    subdomain: "voliinfo",
    tagline: "Informasi Olahraga Voli",
    primaryColor: "330 70% 50%", // Pink
    secondaryColor: "350 70% 48%",
    description: "Portal berita dan informasi seputar voli",
    keywords: ["voli", "olahraga", "bola voli"],
    socialLinks: {
      instagram: "https://instagram.com/voliinfo",
    },
  },
  beritalaut: {
    id: "beritalaut",
    name: "Berita Laut",
    subdomain: "beritalaut",
    tagline: "Warta Maritim Indonesia",
    primaryColor: "40 85% 50%", // Yellow-Orange
    secondaryColor: "30 80% 50%",
    description: "Berita seputar maritim dan kelautan",
    keywords: ["berita laut", "maritim", "kelautan"],
    socialLinks: {
      twitter: "https://twitter.com/beritalaut",
      facebook: "https://facebook.com/beritalaut",
    },
  },
  berasbalap: {
    id: "berasbalap",
    name: "Beras Balap",
    subdomain: "berasbalap",
    tagline: "Berita Otomotif dan Balap",
    primaryColor: "190 75% 38%", // Cyan
    secondaryColor: "170 65% 35%",
    description: "Liputan otomotif, balap, dan dunia kecepatan",
    keywords: ["beras balap", "otomotif", "balap", "racing"],
    socialLinks: {
      twitter: "https://twitter.com/berasbalap",
      instagram: "https://instagram.com/berasbalap",
    },
  },
  cakranews: {
    id: "cakranews",
    name: "CAKRANEWS",
    subdomain: "cakranews",
    domain: "cakrapamungkas.digital",
    tagline: "Berita Terpercaya dan Terkini",
    primaryColor: "220 85% 45%", // Blue-Indigo
    secondaryColor: "200 75% 40%",
    description: "Portal berita terpercaya dari CAKRANEWS",
    keywords: ["cakranews", "berita", "terkini", "terpercaya"],
    socialLinks: {
      twitter: "https://twitter.com/cakranews",
      facebook: "https://facebook.com/cakranews",
      instagram: "https://instagram.com/cakranews",
    },
  },
  mjbnews: {
    id: "mjbnews",
    name: "MJBNEWS",
    subdomain: "mjbnews",
    domain: "guardiansofthetoken.id",
    tagline: "Berita Inovasi dan Teknologi Terkini",
    primaryColor: "280 75% 45%", // Purple
    secondaryColor: "260 65% 40%",
    description: "Portal berita terpercaya dari MJBNEWS dengan fokus pada inovasi dan teknologi",
    keywords: ["mjbnews", "berita", "teknologi", "inovasi", "terkini"],
    socialLinks: {
      twitter: "https://twitter.com/mjbnews",
      facebook: "https://facebook.com/mjbnews",
      instagram: "https://instagram.com/mjbnews",
    },
  },
};

export const getChannelBySubdomain = (subdomain: string): ChannelConfig | null => {
  return CHANNELS[subdomain] || null;
};

export const getChannelByPath = (path: string): ChannelConfig | null => {
  // Extract channel from path like /ambal/article or /ambal
  const channelId = path.split('/')[1];
  return CHANNELS[channelId] || null;
};

export const getAllChannels = (): ChannelConfig[] => {
  return Object.values(CHANNELS);
};
