import React, { useState } from 'react';

const LandingPage = ({ onEnter }) => {
  const [lang, setLang] = useState('en');

  const content = {
    en: {
      enter: "ENTER PLATFORM",
      tagline: "The next generation of urban logistics."
    },
    te: {
      enter: "ప్లాట్‌ఫారమ్‌లోకి వెళ్లండి",
      tagline: "పట్టణ లాజిస్టిక్స్ యొక్క తదుపరి తరం."
    }
  };
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* 1. THE VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
style={{
position: 'fixed',
right: 0,
bottom: 0,
minWidth: '100%',
minHeight: '100%',
objectFit: 'cover',
zIndex: -1,
filter: 'brightness(1.5)',
        }}
      >
        <source src={`${import.meta.env.BASE_URL}assets/hero.mp4`} type="video/mp4" />
      </video>

      {/* LANGUAGE TOGGLE AND LOGOUT */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-4">
        <button 
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          {lang === 'en' ? 'తెలుగు' : 'English'}
        </button>
        
      </div>

      {/* 2. THE INTERACTIVE LAYER */}
      <div className="relative z-10 text-center animate-slide-up px-4">
        <h1 className="text-4xl md:text-8xl font-black italic uppercase text-white tracking-tighter mb-8 drop-shadow-2xl">
          URBAN<span className="text-indigo-500">PULSE</span>
        </h1>

        <button
          onClick={onEnter}
          className="bg-indigo-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-[32px] text-lg md:text-xl font-bold uppercase tracking-widest
                     hover:bg-indigo-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)]"
        >
          {content[lang].enter}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;