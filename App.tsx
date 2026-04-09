import React, { useState, useEffect } from 'react';
import Profile from './src/components/Profile';
import LinkCard from './src/components/LinkCard';
import SocialIcons from './src/components/SocialIcons';
import VisitorCounter from './src/components/VisitorCounter';
import SkeletonProfile from './src/components/SkeletonProfile';
import SkeletonLinkCard from './src/components/SkeletonLinkCard';
import { SITE_DATA } from './constants';

const BackgroundCode = () => {
  const codeSnippets = [
    { text: "const vintec = new AIProvider();", color: "text-blue-500 dark:text-blue-400" },
    { text: "vintec.train({ dataset: 'coding_education' });", color: "text-emerald-500 dark:text-emerald-400" },
    { text: "function accelerateLearning(student) {", color: "text-purple-500 dark:text-purple-400" },
    { text: "  return student.apply(vintec.knowledge);", color: "text-blue-400 dark:text-blue-300" },
    { text: "}", color: "text-purple-500 dark:text-purple-400" },
    { text: "import { neural } from '@vintec/core';", color: "text-pink-500 dark:text-pink-400" },
    { text: "await model.predict(learning_path);", color: "text-amber-500 dark:text-amber-300" },
    { text: "01101100 01101111 01100111", color: "text-slate-400 dark:text-slate-500" },
    { text: "while (true) { build(); innovate(); }", color: "text-emerald-400 dark:text-emerald-300" },
    { text: "git push origin main --force", color: "text-orange-500 dark:text-orange-400" },
    { text: "npm install @vintec/brain", color: "text-red-500 dark:text-red-400" },
    { text: "export const KnowledgeBase = () => {", color: "text-purple-500 dark:text-purple-400" },
    { text: "  return <InteractiveLearning />;", color: "text-blue-500 dark:text-blue-400" },
    { text: "}", color: "text-purple-500 dark:text-purple-400" },
    { text: "const config = { precision: 'high' };", color: "text-blue-400 dark:text-blue-300" },
    { text: "// Machine Learning made simple", color: "text-slate-400 italic" }
  ];

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden select-none bg-slate-950 transition-colors duration-500">
      {/* Primary Code Layer */}
      <div className="absolute inset-0 flex flex-col gap-4 text-[12px] md:text-[16px] font-mono font-light whitespace-nowrap leading-loose animate-scroll-code opacity-50">
        {[...Array(8)].map((_, i) => (
          <React.Fragment key={`layer1-${i}`}>
            {codeSnippets.map((snippet, idx) => (
              <div key={`s1-${idx}`} className={`${(idx + i) % 2 === 0 ? 'pl-4' : 'pl-20'} ${snippet.color} drop-shadow-[0_0_8px_currentColor]`}>
                {snippet.text}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Secondary Distant Layer (Faster, Smaller) */}
      <div className="absolute inset-0 flex flex-col gap-2 text-[10px] md:text-[12px] font-mono font-light whitespace-nowrap leading-tight animate-scroll-code opacity-20" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
        {[...Array(10)].map((_, i) => (
          <React.Fragment key={`layer2-${i}`}>
            {codeSnippets.map((snippet, idx) => (
              <div key={`s2-${idx}`} className={`${(idx + i) % 3 === 0 ? 'pl-40' : 'pl-10'} text-slate-500`}>
                {snippet.text}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 transition-colors duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 transition-colors duration-500"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simulate a loading time
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1500);

    // Lock into dark mode
    document.documentElement.classList.add('dark');

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center px-6 pt-16 pb-12 overflow-x-hidden transition-colors duration-500">
      {mounted && <VisitorCounter />}
      {/* Immersive Coding Background */}
      <BackgroundCode />

      {/* Tech Glow Accents */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px] animate-glow-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 z-10">
        {!mounted ? (
          <>
            <SkeletonProfile />
            <div className="flex flex-col gap-5 mt-8">
              <SkeletonLinkCard />
              <SkeletonLinkCard />
              <SkeletonLinkCard />
            </div>
          </>
        ) : (
          <>
            {/* Profile Header */}
            <Profile
              name={SITE_DATA.name}
              role={SITE_DATA.role}
              bio={SITE_DATA.bio}
              avatarUrl={SITE_DATA.avatarUrl}
              websiteUrl={SITE_DATA.websiteUrl}
            />

            {/* Links Container */}
            <div className="flex flex-col gap-5 mt-8">
              {SITE_DATA.links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>

            {/* Social Links */}
            <SocialIcons socials={SITE_DATA.socials} />

            {/* Footer */}
            <footer className="mt-auto pt-12 text-center">
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                &copy; {new Date().getFullYear()} {SITE_DATA.name}
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default App;