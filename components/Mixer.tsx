'use client';

import { useState } from 'react';
import { Sliders, Volume2, Mic2 } from 'lucide-react';
import type { Song, VocalTrack } from '@/lib/types';

interface MixerProps {
  song: Song;
  onUpdateSong: (song: Song) => void;
}

export default function Mixer({ song, onUpdateSong }: MixerProps) {
  const updateTrack = (trackId: string, updates: Partial<VocalTrack>) => {
    onUpdateSong({
      ...song,
      vocalStacks: song.vocalStacks.map(t => t.id === trackId ? { ...t, ...updates } : t)
    });
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Sliders className="w-5 h-5" /> Vocal Mixer
      </h3>
      
      {song.vocalStacks.length === 0 && (
        <p className="text-gray-500 text-sm italic">No vocal tracks to mix.</p>
      )}

      <div className="space-y-6">
        {song.vocalStacks.map((track) => (
          <div key={track.id} className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mic2 className="w-4 h-4" /> {track.name}
              </span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <input 
                  type="range" min="0" max="2" step="0.1" value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                  className="w-24 accent-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(track.effects).map(([effect, enabled]) => (
                <button
                  key={effect}
                  onClick={() => updateTrack(track.id, { effects: { ...track.effects, [effect]: !enabled } })}
                  className={`text-[10px] px-2 py-1 rounded border transition-all ${enabled ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
