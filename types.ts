export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  url: string;
  icon?: 'lynkid' | 'shopee' | 'whatsapp';
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
  /** label di bawah palette, contoh: "nah gitu dong" */
  accuracyLabel: string;
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
