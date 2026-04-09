import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLinkCard: React.FC = () => {
  return (
    <div className="w-full p-4 rounded-2xl bg-white/5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-center gap-5">
        <motion.div
          className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-700"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="w-2/3 h-4 bg-slate-700 rounded-md"></div>
      </div>
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default SkeletonLinkCard;
