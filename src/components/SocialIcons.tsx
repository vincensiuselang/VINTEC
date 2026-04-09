import React from "react";
import { motion } from "framer-motion";
import { SocialLink } from "../../types";
import {
  TwitterIcon,
  LinkedinIcon,
  YoutubeIcon,
  WhatsappIcon,
  TiktokIcon,
} from "./Icons";

interface SocialIconsProps {
  socials: SocialLink[];
}

const ICON_WRAPPER =
  "flex items-center justify-center text-lg leading-none";

const SocialIcons: React.FC<SocialIconsProps> = ({ socials }) => {
  const renderIcon = (platform: string) => {
    const key = platform.toLowerCase();

    switch (key) {
      case "facebook":
        return (
          <span className={ICON_WRAPPER}>
            <img
              src="/fb.png"
              alt="Facebook"
              className="w-[1em] h-[1em] object-contain"
            />
          </span>
        );

      case "instagram":
        return (
          <span className={ICON_WRAPPER}>
            <img
              src="/ig.png"
              alt="Instagram"
              className="w-[1em] h-[1em] object-contain"
            />
          </span>
        );

      case "twitter":
        return (
          <span className={ICON_WRAPPER}>
            <TwitterIcon />
          </span>
        );

      case "linkedin":
        return (
          <span className={ICON_WRAPPER}>
            <LinkedinIcon />
          </span>
        );

      case "whatsapp":
        return (
          <span className={ICON_WRAPPER}>
            <WhatsappIcon />
          </span>
        );

      case "youtube":
        return (
          <span className={ICON_WRAPPER}>
            <YoutubeIcon />
          </span>
        );

      case "tiktok":
        return (
          <span className={ICON_WRAPPER}>
            <TiktokIcon />
          </span>
        );

      default:{
        return null;
      }
    }
  };

  return (
    <div className="flex justify-center gap-6 mt-10 pb-6">
      {socials.map((social) => (
        <motion.a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.platform}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {renderIcon(social.platform)}
        </motion.a>
      ))}
    </div>
  );
};

export default SocialIcons;
