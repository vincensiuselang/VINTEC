import React, { useState } from 'react';

interface ProfileProps {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  websiteUrl?: string;
}

const Profile: React.FC<ProfileProps> = ({ name, role, bio, avatarUrl, websiteUrl }) => {
  const [progress, setProgress] = useState(0);

  return (
    <div className="flex flex-col items-center text-center space-y-6 mb-8 select-none">
      <div className="relative group w-full flex justify-center">
        {/* Pulsating background glow - heightened when parent is touched */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-600/20 dark:bg-blue-600/30 rounded-full blur-3xl animate-glow-pulse transition-all duration-300 group-active:scale-150 group-active:bg-blue-500/50 group-active:blur-[100px]"></div>
        
        <div className="relative bg-white dark:bg-slate-900 w-40 h-40 md:w-40 md:h-40 p-0 rounded-3xl shadow-xl dark:shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-500 hover:scale-[1.05] hover:border-blue-500/50 group-active:scale-95 group-active:rotate-[-2deg] flex items-center justify-center">
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Vintec&background=1e3a8a&color=fff&size=256';
            }}
          />
        </div>
      </div>
      
      <div className="space-y-4 z-10">
        <div className="block group cursor-pointer">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-200 select-none 
            group-hover:text-blue-600 dark:group-hover:text-blue-400
            active:scale-110 active:rotate-2 active:text-blue-500 dark:active:text-blue-300
            active:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            {name}
          </h1>
        </div>
        <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 dark:bg-blue-900/40 backdrop-blur-md rounded-full border border-blue-200 dark:border-blue-500/30 shadow-sm transition-all duration-300 hover:border-blue-400 hover:scale-105 active:scale-95">
          <p className="text-[10px] md:text-xs font-bold font-apple text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
            {role}
          </p>
        </div>
      </div>

      <div className="relative group w-full px-4 transition-all duration-500">
        <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl blur-xl transition-all duration-500 -z-10"></div>
        
        <p className="max-w-xs mx-auto text-slate-700 dark:text-white leading-relaxed text-sm md:text-base font-semibold whitespace-pre-line 
          dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
          transition-all duration-300 ease-out cursor-default select-none
          group-hover:scale-[1.03] group-hover:text-blue-700 dark:group-hover:text-blue-100
          group-active:scale-[0.97]">
          {bio}
        </p>
        
        <div className="w-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-2 transition-all duration-500 group-hover:w-16 opacity-0 group-hover:opacity-100"></div>
        
      </div>
    </div>
  );
};

export default Profile;