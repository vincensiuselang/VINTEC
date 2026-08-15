import { ProfileData } from "./types";
import vintecLogo from "/public/logovintec2.jpg";

export const SITE_DATA: ProfileData = {
  name: "Vintec",
  role: "Learning AI & Machine Learning",

  bio: `Belajar Machine Learning & AI
  Dari dasar sampai bisa
  Materi praktis | Project real | E-Course`,

  avatarUrl: vintecLogo,
  theme: "dark",

  tabName: "vintec.pkl",
  taglines: ["MATERI PRAKTIS", "PROJECT REAL", "E-COURSE"],

  visitor: {
    namespace: "vintec-tech",
    key: "site",
    fallback: 3043,
  },

  prompt: "mau belajar apa hari ini?",
  accuracyLabel: "nah gitu dong",
  accuracyValue: 80,

  links: [
    {
      id: "1",
      title: "E-Course di Lynk.id",
      subtitle: "koleksi belajar vintec",
      badge: "PALING LARIS 🔥",
      url: "https://lynk.id/bantucoding",
      icon: "lynkid",
      highlighted: true,
    },
    {
      id: "2",
      title: "Belanja di Shopee",
      subtitle: "di toko oren juga ada",
      url: "https://shopee.co.id/shop/1725090121",
      icon: "shopee",
    },
    {
      id: "3",
      title: "Join Grup Whatsapp Base 2",
      subtitle: "komunitas AI · gratis",
      url: "https://chat.whatsapp.com/BpvjYj5o8ne5ZjjPtHu7rc",
      icon: "whatsapp",
    },
    {
      id: "4",
      title: "Chat WhatsApp Vintec",
      subtitle: "mentok tugas ML/DL? serahin ke vintec",
      url: "https://wa.me/6285947094014",
      icon: "whatsapp",
    },
  ],

  socials: [
    {
      platform: "instagram",
      url: "https://www.instagram.com/vintectechnology/",
    },
    {
      platform: "facebook",
      url: "https://www.facebook.com/profile.php?id=61585274431811&locale=id_ID",
    },
    {
      platform: "tiktok",
      url: "https://www.tiktok.com/@vintec_technology",
    },
    {
      platform: "whatsapp",
      url: "https://wa.me/6285947094014",
    },
    {
      platform: "youtube",
      url: "https://www.youtube.com/@VintecTechnology",
    },
  ],
};
