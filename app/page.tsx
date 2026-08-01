'use client';

import { useState, useEffect } from 'react';
import SongGenerator from '@/components/SongGenerator';
import SongLibrary from '@/components/SongLibrary';
import VoiceAssistant from '@/components/VoiceAssistant';
import Mixer from '@/components/Mixer';
import SunoEditor from '@/components/SunoEditor';
import SacredGeometryNav from '@/components/SacredGeometryNav';
import MidiSynth from '@/components/MidiSynth';
import type { Song } from '@/lib/types';
import { Music2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSection, setActiveSection] = useState('generator');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

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
    <main className="relative min-h-screen bg-[#0a0502] text-white overflow-hidden font-sans">
      {/* Immersive Background (Recipe 7) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#3a1510] rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4e00] rounded-full blur-[100px] opacity-20" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#00D4FF] rounded-full blur-[80px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-full border border-white/10">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <h1 className="text-xl font-serif italic tracking-tight">AllIsOne</h1>
          </div>
          <VoiceAssistant 
            songs={songs}
            onSongGenerated={handleSongGenerated} 
            onSongUpdated={handleSongUpdated}
            onSongMastered={handleSongMastered}
            onSongExported={handleSongExported}
            onNavigate={setActiveSection}
          />
        </header>

        {/* Central Navigation Hub */}
        <div className="mb-16">
          <SacredGeometryNav 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>

        {/* Content Area */}
        <div className="w-full max-w-4xl">
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
    </main>
  );
}
