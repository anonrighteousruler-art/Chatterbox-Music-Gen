'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Layers } from 'lucide-react';
import type { Song, VocalTrack } from '@/lib/types';

interface VocalRecorderProps {
  song: Song;
  onUpdateSong: (song: Song) => void;
}

export default function VocalRecorder({ song, onUpdateSong }: VocalRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newTrack: VocalTrack = {
          id: Math.random().toString(36).substring(7),
          name: `Vocal ${song.vocalStacks.length + 1}`,
          audioUrl,
          volume: 1,
          pan: 0,
          effects: {
            echo: false,
            reverb: false,
            gate: false,
            comp: false,
            maximize: false,
            walkieTalkie: false,
          }
        };

        onUpdateSong({
          ...song,
          vocalStacks: [...song.vocalStacks, newTrack]
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4" /> Vocal Stacker
      </h3>
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          aria-pressed={isRecording}
          className={`p-4 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${isRecording ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
        >
          {isRecording ? <Square className="w-6 h-6" aria-hidden="true" /> : <Mic className="w-6 h-6" aria-hidden="true" />}
        </button>
        <div className="text-sm text-gray-400">
          {isRecording ? 'Recording...' : `${song.vocalStacks.length} tracks stacked`}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
