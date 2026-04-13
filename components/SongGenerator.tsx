'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Wand2, Loader2, Upload, FileAudio, Sparkles } from 'lucide-react';
import type { Song } from '@/lib/types';

interface SongGeneratorProps {
  onSongGenerated: (song: Song) => void;
}

export default function SongGenerator({ onSongGenerated }: SongGeneratorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Happy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const genres = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Lo-Fi', 'Classical', 'Hip-Hop', 'Trap', 'R&B'];
  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Dark', 'Mysterious', 'Epic', 'Aggressive'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const newSong: Song = {
        id: Math.random().toString(36).substring(7),
        title: `${mood} ${genre} Track`,
        prompt: prompt,
        genre: genre,
        mood: mood,
        duration: 180,
        audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 10) + 1}.mp3`,
        vocalStacks: [],
        segments: []
      };
      onSongGenerated(newSong);
      setIsGenerating(false);
      setPrompt('');
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create a local URL for the file
    const audioUrl = URL.createObjectURL(file);
    
    // Get duration (optional, but nice)
    const audio = new Audio(audioUrl);
    audio.onloadedmetadata = () => {
      const newSong: Song = {
        id: Math.random().toString(36).substring(7),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        prompt: "Uploaded custom beat",
        genre: "Custom",
        mood: "Unknown",
        duration: Math.floor(audio.duration) || 0,
        audioUrl: audioUrl,
        vocalStacks: [],
        segments: []
      };
      onSongGenerated(newSong);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'generate' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-sm font-medium">Generate</span>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'upload' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload Beat</span>
        </button>
      </div>

      {activeTab === 'generate' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Creation</h2>
              <p className="text-xs text-gray-400">Describe your song and let AI do the rest</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
              Song Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A song about exploring the galaxy..."
              className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
              >
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-gray-900">
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
              >
                {moods.map((m) => (
                  <option key={m} value={m} className="bg-gray-900">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-4 bg-green-600/80 hover:bg-green-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Music className="w-5 h-5" />
                Generate Song
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-green-500/50 transition-colors cursor-pointer group"
               onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <div className="p-4 bg-green-500/10 rounded-full mb-4 group-hover:bg-green-500/20 transition-colors">
              <FileAudio className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Drop your beat here</h3>
            <p className="text-sm text-gray-400 text-center max-w-[200px]">
              Upload your own .mp3 or .wav files to use with Chatterbox
            </p>
            
            {isUploading && (
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing beat...
              </div>
            )}
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Why upload?</h4>
            <ul className="text-xs text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Master your custom beats with voice commands
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Organize your personal library in one place
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Ask Chatterbox for feedback on your tracks
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
