export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  /** promo dari halaman /admin (diisi otomatis dari Supabase) */
  promo?: {
    badge: string;
    /** ISO date — kapan promo berakhir, null = tanpa batas waktu */
    endsAt: string | null;
    priceNormal: number | null;
    pricePromo: number | null;
  };
  url: string;
  icon?: 'lynkid' | 'shopee' | 'whatsapp' | 'website';
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

export interface AccuracyLevel {
  /** label ini dipakai mulai dari nilai `min` (0 - 100) */
  min: number;
  label: string;
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  /** teks di header command palette */
  prompt: string;
  /** label di atas progress bar, berubah sesuai nilai yang digeser */
  accuracyLevels: AccuracyLevel[];
  /** 0 - 100 */
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
