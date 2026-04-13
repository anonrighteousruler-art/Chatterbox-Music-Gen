'use client';

import { useState } from 'react';
import { Music2, Edit2, Check, X } from 'lucide-react';
import type { Song } from '@/lib/types';
import AudioPlayer from './AudioPlayer';
import VocalRecorder from './VocalRecorder';
import Mixer from './Mixer';

interface SongLibraryProps {
  songs: Song[];
  onUpdateSong: (song: Song) => void;
}

export default function SongLibrary({ songs, onUpdateSong }: SongLibraryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', genre: '', mood: '' });

  const genres = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Lo-Fi', 'Classical', 'Hip-Hop'];
  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Dark', 'Mysterious', 'Epic'];

  const startEditing = (song: Song) => {
    setEditingId(song.id);
    setEditForm({ title: song.title, genre: song.genre, mood: song.mood });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = (song: Song) => {
    onUpdateSong({
      ...song,
      title: editForm.title,
      genre: editForm.genre,
      mood: editForm.mood,
    });
    setEditingId(null);
  };

  if (songs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
          <Music2 className="w-12 h-12 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          No songs yet
        </h3>
        <p className="text-gray-500">
          Create your first song to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <div
          key={song.id}
          className="glass-panel rounded-xl p-6 hover:bg-white/5 transition-all"
        >
          {/* Song Info */}
          <div className="mb-4">
            <div className="flex justify-between items-start mb-1">
              {editingId === song.id ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-green-500 w-full mr-2"
                />
              ) : (
                <h3 className="text-lg font-semibold text-white">
                  {song.title}
                  {song.isMastered && (
                    <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] uppercase tracking-wider rounded border border-green-500/30">
                      Mastered
                    </span>
                  )}
                </h3>
              )}
              
              {editingId === song.id ? (
                <div className="flex gap-1">
                  <button onClick={() => saveEditing(song)} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEditing} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => startEditing(song)} className="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
              {song.prompt}
            </p>
            <div className="flex gap-2 items-center flex-wrap">
              {editingId === song.id ? (
                <>
                  <select
                    value={editForm.genre}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                    className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g} className="bg-gray-900">{g}</option>
                    ))}
                  </select>
                  <select
                    value={editForm.mood}
                    onChange={(e) => setEditForm({ ...editForm, mood: e.target.value })}
                    className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
                  >
                    {moods.map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    {song.genre}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {song.mood}
                  </span>
                </>
              )}
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Audio Player */}
          <AudioPlayer song={song} />
          
          {/* Vocal Recorder */}
          <div className="mt-4">
            <VocalRecorder song={song} onUpdateSong={onUpdateSong} />
          </div>
          
          {/* Mixer */}
          <div className="mt-4">
            <Mixer song={song} onUpdateSong={onUpdateSong} />
          </div>
        </div>
      ))}
    </div>
  );
}
