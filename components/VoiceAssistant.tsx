'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Mic, MicOff, Settings, Volume2, Sparkles, MessageSquare } from 'lucide-react';
import { base64ToFloat32Array, float32ToPcm16Base64 } from '@/lib/audio';
import type { Song } from '@/lib/types';

interface VoiceAssistantProps {
  songs: Song[];
  onSongGenerated: (song: Song) => void;
  onSongUpdated: (song: Song) => void;
  onSongMastered: (songId: string) => void;
  onSongExported: (songId: string) => void;
}

export default function VoiceAssistant({ 
  songs, 
  onSongGenerated, 
  onSongUpdated, 
  onSongMastered, 
  onSongExported 
}: VoiceAssistantProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState('Zephyr');
  const [showSettings, setShowSettings] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const songsRef = useRef<Song[]>(songs);

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      nextPlayTimeRef.current = audioCtx.currentTime;

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        throw new Error("Microphone access denied. Please allow microphone permissions in your browser.");
      }
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;

      source.connect(processor);
      processor.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const generateSongDeclaration = {
        name: "generateSong",
        description: "Generates a new song based on a prompt, genre, and mood.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING, description: "Description of the song" },
            genre: { type: Type.STRING, description: "Musical genre (e.g., Pop, Rock, Electronic)" },
            mood: { type: Type.STRING, description: "Mood of the song (e.g., Happy, Sad, Energetic)" }
          },
          required: ["prompt", "genre", "mood"]
        }
      };

      const updateSongDeclaration = {
        name: "updateSong",
        description: "Updates an existing song's details like title, genre, or mood. Use the song's current title to identify it.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            currentTitle: { type: Type.STRING, description: "The current title of the song to update" },
            newTitle: { type: Type.STRING, description: "The new title for the song (optional)" },
            newGenre: { type: Type.STRING, description: "The new genre for the song (optional)" },
            newMood: { type: Type.STRING, description: "The new mood for the song (optional)" }
          },
          required: ["currentTitle"]
        }
      };

      const masterSongDeclaration = {
        name: "masterSong",
        description: "Masters a song to improve its audio quality. Use the song's title to identify it.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the song to master" }
          },
          required: ["title"]
        }
      };

      const exportSongDeclaration = {
        name: "exportSong",
        description: "Exports and downloads a song. Use the song's title to identify it.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the song to export" }
          },
          required: ["title"]
        }
      };

      const searchLibraryDeclaration = {
        name: "searchLibrary",
        description: "Searches the user's song library by title, genre, or mood.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "The search term (title, genre, or mood)" }
          },
          required: ["query"]
        }
      };

      const addVocalTrackDeclaration = {
        name: "addVocalTrack",
        description: "Simulates recording and adding a new vocal track to a specific song.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING, description: "The title of the song to add the vocal track to" },
            trackName: { type: Type.STRING, description: "The name for the new vocal track (e.g., 'Lead Vocal', 'Backing 1')" }
          },
          required: ["songTitle", "trackName"]
        }
      };

      const updateMixerDeclaration = {
        name: "updateMixer",
        description: "Updates the mixer settings (volume, pan, or effects) for a specific vocal track in a song.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING, description: "The title of the song" },
            trackName: { type: Type.STRING, description: "The name of the vocal track to update" },
            volume: { type: Type.NUMBER, description: "Volume level from 0.0 to 2.0 (optional)" },
            pan: { type: Type.NUMBER, description: "Panning from -1.0 (left) to 1.0 (right) (optional)" },
            effectName: { type: Type.STRING, description: "Name of the effect to toggle (echo, reverb, gate, comp, maximize, walkieTalkie) (optional)" },
            effectEnabled: { type: Type.BOOLEAN, description: "Whether the effect should be enabled or disabled (optional)" }
          },
          required: ["songTitle", "trackName"]
        }
      };

      const manageVocalTrackDeclaration = {
        name: "manageVocalTrack",
        description: "Renames or deletes an existing vocal track.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING, description: "The title of the song" },
            trackName: { type: Type.STRING, description: "The current name of the vocal track" },
            action: { type: Type.STRING, description: "The action to perform: 'rename' or 'delete'" },
            newName: { type: Type.STRING, description: "The new name for the track (required if action is 'rename')" }
          },
          required: ["songTitle", "trackName", "action"]
        }
      };

      const baseInstruction = "You are Chatterbox, an AI music assistant that exists as an Audio Orb. You can help the user generate, edit, master, export, and search for songs in their library. You also have full control over the DAW features: you can add simulated vocal tracks to a song using addVocalTrack, update mixer settings (volume, pan, effects like echo, reverb, walkieTalkie) using updateMixer, and rename or delete tracks using manageVocalTrack. Be conversational, enthusiastic, and helpful. Keep responses concise. When a user asks to edit, master, or mix, ask for the song title if they haven't provided it. Encourage the user to upload their own beats so you can help them master or organize them!";
      const finalInstruction = customInstructions ? `${baseInstruction} Additionally, follow these user-provided rules: ${customInstructions}` : baseInstruction;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: finalInstruction,
          tools: [{ functionDeclarations: [generateSongDeclaration, updateSongDeclaration, masterSongDeclaration, exportSongDeclaration, searchLibraryDeclaration, addVocalTrackDeclaration, updateMixerDeclaration, manageVocalTrackDeclaration] }]
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64 = float32ToPcm16Base64(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ audio: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
          },
          onmessage: async (message) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const float32Data = base64ToFloat32Array(base64Audio);
              const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
              audioBuffer.getChannelData(0).set(float32Data);

              const playSource = audioContextRef.current.createBufferSource();
              playSource.buffer = audioBuffer;
              playSource.connect(audioContextRef.current.destination);

              const startTime = Math.max(audioContextRef.current.currentTime, nextPlayTimeRef.current);
              playSource.start(startTime);
              nextPlayTimeRef.current = startTime + audioBuffer.duration;
            }

            // Handle interruption
            if (message.serverContent?.interrupted && audioContextRef.current) {
              nextPlayTimeRef.current = audioContextRef.current.currentTime;
            }

            // Handle tool calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                const responses: any[] = [];
                for (const call of functionCalls) {
                  let result = "Operation failed.";
                  
                  if (call.name === 'generateSong') {
                    const args = call.args as any;
                    const newSong: Song = {
                      id: Math.random().toString(36).substring(7),
                      title: `${args.mood} ${args.genre} Track`,
                      prompt: args.prompt,
                      genre: args.genre,
                      mood: args.mood,
                      duration: 180,
                      audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 10) + 1}.mp3`,
                      vocalStacks: [],
                      segments: []
                    };
                    onSongGenerated(newSong);
                    result = "Song generated successfully!";
                  } else if (call.name === 'updateSong') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.currentTitle.toLowerCase());
                    if (song) {
                      const updatedSong = {
                        ...song,
                        title: args.newTitle || song.title,
                        genre: args.newGenre || song.genre,
                        mood: args.newMood || song.mood
                      };
                      onSongUpdated(updatedSong);
                      result = `Song "${song.title}" updated successfully!`;
                    } else {
                      result = `Could not find a song titled "${args.currentTitle}".`;
                    }
                  } else if (call.name === 'masterSong') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.title.toLowerCase());
                    if (song) {
                      onSongMastered(song.id);
                      result = `Song "${song.title}" has been mastered!`;
                    } else {
                      result = `Could not find a song titled "${args.title}".`;
                    }
                  } else if (call.name === 'exportSong') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.title.toLowerCase());
                    if (song) {
                      onSongExported(song.id);
                      result = `Exporting song "${song.title}" now.`;
                    } else {
                      result = `Could not find a song titled "${args.title}".`;
                    }
                  } else if (call.name === 'searchLibrary') {
                    const args = call.args as any;
                    const query = args.query.toLowerCase();
                    const results = songsRef.current.filter(s => 
                      s.title.toLowerCase().includes(query) ||
                      s.genre.toLowerCase().includes(query) ||
                      s.mood.toLowerCase().includes(query)
                    );
                    if (results.length > 0) {
                      result = `Found ${results.length} songs: ${results.map(s => s.title).join(', ')}`;
                    } else {
                      result = `No songs found matching "${args.query}".`;
                    }
                  } else if (call.name === 'addVocalTrack') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.songTitle.toLowerCase());
                    if (song) {
                      const newTrack = {
                        id: Math.random().toString(36).substring(7),
                        name: args.trackName,
                        audioUrl: '', // Simulated
                        volume: 1,
                        pan: 0,
                        effects: { echo: false, reverb: false, gate: false, comp: false, maximize: false, walkieTalkie: false }
                      };
                      onSongUpdated({ ...song, vocalStacks: [...song.vocalStacks, newTrack] });
                      result = `Added vocal track "${args.trackName}" to "${song.title}".`;
                    } else {
                      result = `Could not find song "${args.songTitle}".`;
                    }
                  } else if (call.name === 'updateMixer') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.songTitle.toLowerCase());
                    if (song) {
                      const trackIndex = song.vocalStacks.findIndex(t => t.name.toLowerCase() === args.trackName.toLowerCase());
                      if (trackIndex !== -1) {
                        const track = song.vocalStacks[trackIndex];
                        const updatedTrack = { ...track };
                        if (args.volume !== undefined) updatedTrack.volume = args.volume;
                        if (args.pan !== undefined) updatedTrack.pan = args.pan;
                        if (args.effectName && args.effectEnabled !== undefined) {
                          updatedTrack.effects = { ...updatedTrack.effects, [args.effectName]: args.effectEnabled };
                        }
                        const newStacks = [...song.vocalStacks];
                        newStacks[trackIndex] = updatedTrack;
                        onSongUpdated({ ...song, vocalStacks: newStacks });
                        result = `Updated mixer for track "${args.trackName}".`;
                      } else {
                        result = `Could not find track "${args.trackName}" in song "${song.title}".`;
                      }
                    } else {
                      result = `Could not find song "${args.songTitle}".`;
                    }
                  } else if (call.name === 'manageVocalTrack') {
                    const args = call.args as any;
                    const song = songsRef.current.find(s => s.title.toLowerCase() === args.songTitle.toLowerCase());
                    if (song) {
                      if (args.action === 'delete') {
                        onSongUpdated({ ...song, vocalStacks: song.vocalStacks.filter(t => t.name.toLowerCase() !== args.trackName.toLowerCase()) });
                        result = `Deleted track "${args.trackName}".`;
                      } else if (args.action === 'rename' && args.newName) {
                        onSongUpdated({
                          ...song,
                          vocalStacks: song.vocalStacks.map(t => t.name.toLowerCase() === args.trackName.toLowerCase() ? { ...t, name: args.newName } : t)
                        });
                        result = `Renamed track "${args.trackName}" to "${args.newName}".`;
                      } else {
                        result = `Invalid action or missing newName for rename.`;
                      }
                    } else {
                      result = `Could not find song "${args.songTitle}".`;
                    }
                  }

                  responses.push({
                    id: call.id,
                    name: call.name,
                    response: { result }
                  });
                }

                if (responses.length > 0) {
                  sessionPromise.then(session => {
                    session.sendToolResponse({ functionResponses: responses });
                  });
                }
              }
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            if (err?.message?.includes("unavailable")) {
              setError("The AI service is temporarily busy. Please wait a few seconds and try again.");
            } else {
              setError("Connection lost. Please try reconnecting.");
            }
            disconnect();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error: any) {
      console.error("Failed to connect:", error);
      setError(error.message || "An unexpected error occurred.");
      setIsConnecting(false);
      disconnect();
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-8 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-14 right-4 glass-panel p-6 rounded-xl z-20 w-80">
          <h4 className="text-sm font-semibold mb-4 text-gray-300">Assistant Settings</h4>
          
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Voice Selection</label>
            <div className="grid grid-cols-2 gap-2">
              {voices.map(v => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${voice === v ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Custom Instructions
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Talk like a pirate, be very nitpicky about music theory..."
              className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            />
            <p className="text-[10px] text-gray-500 mt-2 italic">Reconnect to apply new instructions.</p>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-green-400" />
          Chatterbox AI
        </h2>
        <p className="text-gray-400 text-sm">Your hands-free voice assistant for music creation.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center max-w-md">
          {error}
        </div>
      )}

      <div className="relative flex items-center justify-center w-48 h-48 mb-8">
        {/* The Audio Orb */}
        <div className={`absolute w-32 h-32 rounded-full transition-all duration-500 ${isConnected ? 'bg-green-500/20 orb-pulse' : 'bg-white/5 border border-white/10'}`}></div>
        <div className={`absolute w-24 h-24 rounded-full transition-all duration-500 ${isConnected ? 'bg-green-400/30' : 'bg-white/10'}`}></div>
        <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isConnected ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'bg-gray-800 text-gray-400'}`}>
          {isConnected ? <Volume2 className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
        </div>
      </div>

      <div className="flex gap-4">
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-8 py-3 bg-green-600/80 hover:bg-green-500 text-white rounded-full font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Start Listening'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-8 py-3 bg-red-600/80 hover:bg-red-500 text-white rounded-full font-medium transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] flex items-center gap-2"
          >
            <MicOff className="w-5 h-5" />
            Stop Listening
          </button>
        )}
      </div>
    </div>
  );
}
