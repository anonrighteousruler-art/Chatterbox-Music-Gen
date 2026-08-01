'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Piano, Power, PowerOff, Activity, Settings2 } from 'lucide-react';

const START_NOTE = 48; // C3
const NUM_KEYS = 25; // 2 octaves

const midiToFreq = (note: number) => 440 * Math.pow(2, (note - 69) / 12);
const isBlackKey = (note: number) => {
  const n = note % 12;
  return n === 1 || n === 3 || n === 6 || n === 8 || n === 10;
};

export default function MidiSynth() {
  const [hasAudioContext, setHasAudioContext] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode }>>(new Map());
  
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [midiStatus, setMidiStatus] = useState<string>('Initializing Web MIDI...');
  const [waveform, setWaveform] = useState<OscillatorType>('sawtooth');
  const [volume, setVolume] = useState(0.5);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setHasAudioContext(true);
  };

  const playNote = useCallback((note: number, velocity: number = 100) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const existing = oscillatorsRef.current.get(note);
    if (existing) {
      try {
        existing.osc.stop();
        existing.osc.disconnect();
        existing.gain.disconnect();
      } catch (e) {}
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = waveform;
    osc.frequency.value = midiToFreq(note);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const v = (velocity / 127) * volume;
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.05); // Quick attack

    osc.start();
    oscillatorsRef.current.set(note, { osc, gain: gainNode });

    setActiveNotes(prev => Array.from(new Set([...prev, note])));
  }, [waveform, volume]);

  const stopNote = useCallback((note: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const active = oscillatorsRef.current.get(note);

    if (active) {
      active.gain.gain.cancelScheduledValues(ctx.currentTime);
      active.gain.gain.setValueAtTime(active.gain.gain.value, ctx.currentTime);
      active.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Release
      active.osc.stop(ctx.currentTime + 0.5);
      
      setTimeout(() => {
        try {
          active.osc.disconnect();
          active.gain.disconnect();
        } catch (e) {}
        oscillatorsRef.current.delete(note);
      }, 500);
    }

    setActiveNotes(prev => prev.filter(n => n !== note));
  }, []);

  useEffect(() => {
    let midiAccess: any = null;
    
    const onMIDIMessage = (event: any) => {
      const [status, data1, data2] = event.data;
      const cmd = status >> 4;
      const note = data1;
      const velocity = data2;
      
      // Channel 1-16 (status 144-159 is Note On)
      if (cmd === 9 && velocity > 0) {
        playNote(note, velocity);
      } else if (cmd === 8 || (cmd === 9 && velocity === 0)) {
        stopNote(note);
      }
    };

    const setupMIDI = async () => {
      const nav: any = navigator;
      if (nav.requestMIDIAccess) {
        try {
          midiAccess = await nav.requestMIDIAccess();
          
          const updateInputs = () => {
            const inputs = Array.from(midiAccess.inputs.values());
            if (inputs.length > 0) {
              setMidiStatus(`Connected: ${inputs.length} MIDI Device(s)`);
              inputs.forEach((input: any) => {
                input.onmidimessage = onMIDIMessage;
              });
            } else {
              setMidiStatus('No MIDI Devices Found. Connect one or use the screen keys.');
            }
          };

          updateInputs();
          midiAccess.onstatechange = updateInputs;
          
        } catch (err) {
          console.error('MIDI Access Failed', err);
          setMidiStatus('MIDI Access Denied or Unavailable.');
        }
      } else {
        setMidiStatus('Web MIDI API NOT Supported in this browser.');
      }
    };
    
    setupMIDI();
    
    return () => {
      if (midiAccess) {
        Array.from(midiAccess.inputs.values()).forEach((input: any) => {
          input.onmidimessage = null;
        });
      }
    };
  }, [playNote, stopNote]);

  // Global cleanup
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(({ osc, gain }) => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    }
  }, []);

  const keys = Array.from({ length: NUM_KEYS }).map((_, i) => START_NOTE + i);

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-8 max-w-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.1)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-serif italic flex items-center gap-2">
            <Piano className="w-6 h-6 text-purple-400" aria-hidden="true" />
            Sacred Synthesizer
          </h2>
          <p className="text-xs font-mono text-purple-300/60 flex items-center gap-1 mt-2">
            <Activity className="w-3 h-3" aria-hidden="true" /> {midiStatus}
          </p>
        </div>
        
        <button
          onClick={initAudio}
          disabled={hasAudioContext}
          aria-label={hasAudioContext ? "Audio Engine Active" : "Power On Audio Engine"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
            hasAudioContext 
              ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30' 
              : 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'
          }`}
        >
          {hasAudioContext ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          {hasAudioContext ? "Audio Active" : "Power On"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-semibold opacity-60 uppercase tracking-widest flex items-center gap-1">
            <Settings2 className="w-3 h-3" /> Wave Structure
          </label>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Waveform Selection">
            {(['sawtooth', 'square', 'sine', 'triangle'] as OscillatorType[]).map((wave) => (
              <button
                key={wave}
                onClick={() => setWaveform(wave)}
                aria-pressed={waveform === wave}
                className={`py-2 px-1 border rounded-lg text-[10px] uppercase font-mono transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 ${
                  waveform === wave 
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                {wave}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold opacity-60 uppercase tracking-widest flex items-center justify-between">
            <span>Amplitude (Volume)</span>
            <span className="text-purple-400 font-mono">{Math.round(volume * 100)}%</span>
          </label>
          <div className="pt-2">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Synthesizer Volume"
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
            />
          </div>
        </div>
      </div>

      <div 
        className="relative mt-8 h-40 bg-black/40 p-2 rounded-xl border border-white/10 flex select-none touch-none overflow-hidden" 
        role="group" 
        aria-label="Virtual Piano Keyboard"
      >
        {!hasAudioContext && (
          <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/20 flex flex-col items-center justify-center pointer-events-none rounded-xl">
            <p className="text-sm font-mono text-white/80 border border-white/20 px-4 py-2 rounded-lg bg-black/50 shadow-lg">POWER ON ABOVE TO PLAY</p>
          </div>
        )}
        
        {/* Render keys */}
        {keys.map((note) => {
          const black = isBlackKey(note);
          const active = activeNotes.includes(note);
          
          if (black) return null; // We render black keys absolutely positioned

          return (
            <button
              key={note}
              onMouseDown={() => hasAudioContext && playNote(note)}
              onMouseUp={() => hasAudioContext && stopNote(note)}
              onMouseLeave={() => hasAudioContext && stopNote(note)}
              onTouchStart={(e) => { e.preventDefault(); hasAudioContext && playNote(note); }}
              onTouchEnd={(e) => { e.preventDefault(); hasAudioContext && stopNote(note); }}
              aria-label={`Play Note ${note}`}
              className={`flex-1 h-full mx-px rounded-b transition-colors relative z-0 outline-none ${
                active 
                  ? 'bg-purple-300 shadow-[inset_0_-5px_15px_rgba(147,51,234,0.5)]' 
                  : 'bg-white hover:bg-zinc-200 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.2)]'
              }`}
            />
          );
        })}

        {/* Black keys overlay */}
        <div className="absolute top-2 left-2 right-2 flex pointer-events-none">
          {keys.map((note) => {
            const black = isBlackKey(note);
            const active = activeNotes.includes(note);

            if (!black) {
              return <div key={note} className="flex-1 pointer-events-none" />; // White key space
            }

            return (
              <div key={note} className="w-0 relative pointer-events-none z-10">
                <button
                  onMouseDown={() => hasAudioContext && playNote(note)}
                  onMouseUp={() => hasAudioContext && stopNote(note)}
                  onMouseLeave={() => hasAudioContext && stopNote(note)}
                  onTouchStart={(e) => { e.preventDefault(); hasAudioContext && playNote(note); }}
                  onTouchEnd={(e) => { e.preventDefault(); hasAudioContext && stopNote(note); }}
                  aria-label={`Play Black Key Note ${note}`}
                  className={`absolute -left-3 top-0 w-6 h-24 rounded-b pointer-events-auto transition-colors outline-none ${
                    active 
                      ? 'bg-purple-500 shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)]' 
                      : 'bg-black shadow-[inset_0_-5px_10px_rgba(255,255,255,0.2)] hover:bg-zinc-800 border border-zinc-700'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="text-center text-xs opacity-40 font-mono">
        Connect a MIDI controller or use the mouse/touchscreen.
      </p>
    </div>
  );
}
