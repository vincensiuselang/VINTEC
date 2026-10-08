export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  /** warna badge: "orange" (default, kayak PALING LARIS) atau "cyan" (warna Vintec Learn) */
  badgeTone?: 'orange' | 'cyan';
  url: string;
  icon?: 'lynkid' | 'shopee' | 'whatsapp' | 'vinteclearning';
  highlighted?: boolean;
}

export interface SocialLink {
  platform:
    | 'twitter'
    | 'instagram'
    | 'github'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'email'
    | 'facebook'
    | 'whatsapp';
  url: string;
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  /** teks di header command palette */
  prompt: string;
  /**
   * Keterangan bar accuracy yang bisa digeser.
   * Label yang dipakai = level terakhir yang `min`-nya <= nilai sekarang.
   * Urutkan dari `min` paling kecil ke paling besar.
   */
  accuracyLevels: { min: number; label: string }[];
  /** posisi awal bar, 0 - 100 */
  accuracyValue: number;
  /** nama tab di window bar */
  tabName: string;
  /** teks kecil di bawah code block hero */
  taglines: string[];
  /** counter pengunjung global (disimpan di abacus.jasoncameron.dev) */
  visitor: {
    namespace: string;
    key: string;
    /** angka yang ditampilkan kalau API-nya gagal diakses */
    fallback: number;
  };
  links: LinkItem[];
  socials: SocialLink[];
  theme: 'light' | 'dark' | 'glass';
  websiteUrl?: string;
}
