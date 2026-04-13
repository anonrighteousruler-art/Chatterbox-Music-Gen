export interface VocalTrack {
  id: string;
  name: string;
  audioUrl: string;
  volume: number;
  pan: number;
  effects: {
    echo: boolean;
    reverb: boolean;
    gate: boolean;
    comp: boolean;
    maximize: boolean;
    walkieTalkie: boolean;
  };
}

export interface SongSegment {
  id: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  start: number;
  end: number;
}

export interface Song {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
  audioUrl: string;
  isMastered?: boolean;
  vocalStacks: VocalTrack[];
  segments: SongSegment[];
}
