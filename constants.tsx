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
  taglines: ["MATERI PRAKTIS", "PROJECT DUNIA NYATA", "VIDEO BELAJAR"],

  visitor: {
    namespace: "vintec-tech",
    key: "site",
    fallback: 3043,
  },

  prompt: "mau belajar apa hari ini?",
  // label progress bar — berubah pas bar-nya digeser
  accuracyLevels: [
    { min: 0, label: "underfitting parah 💀" },
    { min: 20, label: "masih belajar dikit-dikit 😅" },
    { min: 40, label: "lumayan, lanjut training 📈" },
    { min: 60, label: "makin jago nih 💪" },
    { min: 80, label: "nah gitu dong 🔥" },
    { min: 95, label: "awas overfitting! 🤯" },
  ],
  accuracyValue: 80,

  links: [
    {
      id: "1",
      title: "E-Course di Lynk.id",
      subtitle: "Temukan koleksi lengkap belajar AI/ML",
      badge: "PALING LARIS",
      url: "https://lynk.id/bantucoding",
      icon: "lynkid",
      highlighted: true,
    },
    {
      id: "2",
      title: "Belanja di Shopee",
      subtitle: "Beli koleksi belajar di Shopee",
      url: "https://shopee.co.id/shop/1725090121",
      icon: "shopee",
    },
    {
      id: "3",
      title: "Website Vintec Learning",
      badge: "TEMPAT BELAJAR",
      subtitle: "Tempat lo belajar dan ngulik AI/ML",
      url: "https://vinteclearning.com",
      icon: "website",
    },
    {
      id: "4",
      title: "Join Grup Whatsapp Base 2",
      subtitle: "Ngobrol, belajar, dan dapet materi AI gratis",
      url: "https://chat.whatsapp.com/BpvjYj5o8ne5ZjjPtHu7rc",
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
