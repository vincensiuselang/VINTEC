
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  highlighted?: boolean;
  variant?: 'orange' | 'green' | 'light-green' | 'light-blue';
}

export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'github' | 'linkedin' | 'youtube' | 'tiktok' | 'email' | 'facebook' | 'whatsapp';
  url: string;
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  links: LinkItem[];
  socials: SocialLink[];
  theme: 'light' | 'dark' | 'glass';
  // Add websiteUrl as an optional property
  websiteUrl?: string;
}