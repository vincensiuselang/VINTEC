import { ProfileData } from "./types";
import vintecLogo from "/public/logovintec2.jpg";

export const SITE_DATA: ProfileData = {
  name: "Vintec",
  role: "Learning AI & Machine Learning",

  bio: `Belajar Machine Learning & AI
  Dari dasar sampai bisa  
  Materi praktis | Project real | E-Course`,

  avatarUrl: vintecLogo,
  theme: "light",

  links: [
    {
      id: "2",
      title: "Lynk.id",
      url: "https://lynk.id/bantucoding",
      icon: "lynkid",
      variant: "green",
    },
          {
      id: "1",
      title: "Shopee",
      url: "https://shopee.co.id/shop/1725090121",
      icon: "shopee",
      variant: "orange",
      highlighted: true,
    },
    {
      id: "4",
      title: "Vintec AI Public Group",
      url: "https://chat.whatsapp.com/ITETy5Vri8F5d7nUVytby0",
      icon: "whatsapp",
      variant: "light-green",
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
