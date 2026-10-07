'use client';

import { useState, useEffect } from 'react';
import SongGenerator from '@/components/SongGenerator';
import SongLibrary from '@/components/SongLibrary';
import VoiceAssistant from '@/components/VoiceAssistant';
import Mixer from '@/components/Mixer';
import SunoEditor from '@/components/SunoEditor';
import SidebarNav from '@/components/SidebarNav';
import FeedbackModal from '@/components/FeedbackModal';
import MidiSynth from '@/components/MidiSynth';
import type { Song } from '@/lib/types';
import { Music2, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSection, setActiveSection] = useState('generator');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
  }, [theme]);

  const selectedSong = songs.find(s => s.id === selectedSongId) || songs[0];

  const handleSongGenerated = (newSong: Song) => {
    setSongs((prev) => [{
      ...newSong,
      vocalStacks: [],
      segments: []
    }, ...prev]);
    setSelectedSongId(newSong.id);
  };

  const handleSongUpdated = (updatedSong: Song) => {
    setSongs((prev) => prev.map((song) => song.id === updatedSong.id ? updatedSong : song));
  };

  const handleSongMastered = (songId: string) => {
    setSongs((prev) => prev.map((song) => song.id === songId ? { ...song, isMastered: true } : song));
  };

  const handleSongExported = (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (song) {
      const link = document.createElement('a');
      link.href = song.audioUrl;
      link.download = `${song.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className={`relative min-h-screen transition-colors duration-500 overflow-hidden font-sans ${theme === 'dark' ? 'bg-[#0a0502] text-white' : 'bg-[#faf9f6] text-stone-900'}`}>
      {/* Immersive Background (Recipe 7) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden transition-all duration-700">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-700 ${theme === 'dark' ? 'bg-[#3a1510] opacity-30 animate-pulse' : 'bg-purple-100/30 opacity-40'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-all duration-700 ${theme === 'dark' ? 'bg-[#ff4e00] opacity-20' : 'bg-orange-100/20 opacity-40'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[80px] transition-all duration-700 ${theme === 'dark' ? 'bg-[#00D4FF] opacity-10' : 'bg-emerald-100/10 opacity-30'}`} />
      </div>

      <div className="relative z-10 flex h-screen w-full">
        {/* Sidebar Navigation */}
        <SidebarNav 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full px-8 py-8 flex flex-col flex-1">
            {/* Header */}
            <header className="w-full flex justify-end items-center mb-12 pb-6 border-b border-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 flex items-center justify-center text-orange-500 shadow-sm"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />}
                </button>
                <VoiceAssistant 
                  songs={songs}
                  onSongGenerated={handleSongGenerated} 
                  onSongUpdated={handleSongUpdated}
                  onSongMastered={handleSongMastered}
                  onSongExported={handleSongExported}
                  onNavigate={setActiveSection}
                />
              </div>
            </header>

            {/* Content Area */}
            <div className="w-full">
              <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeSection === 'generator' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif italic mb-2">Sound Manifestation</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 72 | LAM</p>
                  </div>
                  <SongGenerator onSongGenerated={handleSongGenerated} />
                </div>
              )}

              {activeSection === 'library' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif italic mb-2">Akashic Records</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 432 | VAM</p>
                  </div>
                  <SongLibrary songs={songs} onUpdateSong={handleSongUpdated} />
                </div>
              )}

              {activeSection === 'mixer' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif italic mb-2">Harmonic Balance</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 108 | RAM</p>
                  </div>
                  {selectedSong ? (
                    <Mixer song={selectedSong} onUpdateSong={handleSongUpdated} />
                  ) : (
                    <div className="glass-panel p-12 text-center text-zinc-500 italic">
                      Manifest a sound first to access the mixer.
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'editor' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif italic mb-2">Temporal Weaver</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 369 | YAM</p>
                  </div>
                  {selectedSong ? (
                    <SunoEditor song={selectedSong} onUpdateSong={handleSongUpdated} />
                  ) : (
                    <div className="glass-panel p-12 text-center text-zinc-500 italic">
                      Select a song from the records to edit its structure.
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'assistant' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif italic mb-2">The Oracle</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 9 | HAM</p>
                  </div>
                  <div className="glass-panel p-12 text-center">
                    <p className="text-zinc-400 mb-4">Chatterbox is listening in the header above.</p>
                    <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Speak your intentions into the void.</p>
                  </div>
                </div>
              )}
              {activeSection === 'instrument' && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-serif italic mb-2">Sonic Alchemy Channel</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Sum: 528 | OM</p>
                  </div>
                  <MidiSynth />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        </div>
      </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
