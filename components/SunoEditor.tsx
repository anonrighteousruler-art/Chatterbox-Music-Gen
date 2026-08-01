'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Plus, Play, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Song, SongSegment } from '@/lib/types';

interface SunoEditorProps {
  song: Song;
  onUpdateSong: (song: Song) => void;
}

export default function SunoEditor({ song, onUpdateSong }: SunoEditorProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const addSegment = (type: SongSegment['type']) => {
    const newSegment: SongSegment = {
      id: Math.random().toString(36).substring(7),
      type,
      start: song.segments.length > 0 ? song.segments[song.segments.length - 1].end : 0,
      end: (song.segments.length > 0 ? song.segments[song.segments.length - 1].end : 0) + 30,
    };
    onUpdateSong({ ...song, segments: [...song.segments, newSegment] });
  };

  const removeSegment = (id: string) => {
    onUpdateSong({ ...song, segments: song.segments.filter(s => s.id !== id) });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scissors className="w-5 h-5 text-pink-500" aria-hidden="true" /> Structure Editor
        </h2>
        <div className="flex gap-2">
          <button 
            aria-label="Save structure"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Timeline View */}
      <div 
        role="group"
        aria-label="Segment Timeline"
        className="relative h-24 bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center p-2 gap-1"
      >
        {song.segments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm italic">
            No segments defined. Add segments to build your song structure.
          </div>
        )}
        {song.segments.map((segment) => (
          <motion.div
            key={segment.id}
            layoutId={segment.id}
            onClick={() => setSelectedSegment(segment.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedSegment(segment.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={selectedSegment === segment.id}
            aria-label={`${segment.type} segment, ${segment.end - segment.start} seconds`}
            className={`h-full rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500 ${
              selectedSegment === segment.id 
                ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            style={{ width: `${(segment.end - segment.start) * 2}px`, minWidth: '60px' }}
          >
            <span className="text-[10px] uppercase font-bold tracking-tighter opacity-60 pointer-events-none">{segment.type}</span>
            <span className="text-xs font-mono pointer-events-none">{segment.end - segment.start}s</span>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 id="add-segment-heading" className="text-sm font-semibold opacity-60 uppercase tracking-widest">Add Segment</h3>
          <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="add-segment-heading">
            {(['intro', 'verse', 'chorus', 'bridge', 'outro'] as const).map((type) => (
              <button
                key={type}
                onClick={() => addSegment(type)}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Add ${type} segment`}
              >
                <Plus className="w-3 h-3" aria-hidden="true" /> {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold opacity-60 uppercase tracking-widest">Segment Details</h3>
          {selectedSegment ? (
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-pink-400" aria-label={`Segment ID: ${selectedSegment}`}>ID: {selectedSegment}</span>
                <button 
                  onClick={() => removeSegment(selectedSegment)}
                  aria-label="Remove Segment"
                  className="text-[10px] text-red-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 rounded px-1"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-1">
                <label htmlFor="segment-lyrics" className="text-[10px] uppercase opacity-40">Lyrics / Prompt</label>
                <textarea 
                  id="segment-lyrics"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs h-20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter lyrics for this section..."
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl p-8 text-zinc-600 text-xs text-center">
              Select a segment on the timeline to edit its properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
