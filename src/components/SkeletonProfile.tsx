import React from 'react';
import { motion } from 'framer-motion';

const SkeletonProfile: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-slate-700"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="w-3/4 h-6 bg-slate-700 rounded-md"></div>
      <div className="w-1/2 h-4 bg-slate-700 rounded-md"></div>
    </div>
  );
};

export default SkeletonProfile;
