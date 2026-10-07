'use client';

import { Music, Library, Sliders, Edit3, MessageSquare, Piano, Sparkles, MessageCircle } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  gematria: number;
  mantra: string;
  icon: any;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'Generator', gematria: 72, mantra: 'LAM', icon: Music, color: '#FF4E00' },
  { id: 'library', label: 'Library', gematria: 432, mantra: 'VAM', icon: Library, color: '#00FF00' },
  { id: 'mixer', label: 'Mixer', gematria: 108, mantra: 'RAM', icon: Sliders, color: '#00D4FF' },
  { id: 'editor', label: 'Editor', gematria: 369, mantra: 'YAM', icon: Edit3, color: '#FF00D4' },
  { id: 'assistant', label: 'Assistant', gematria: 9, mantra: 'HAM', icon: MessageSquare, color: '#FFD700' },
  { id: 'instrument', label: 'Synthesizer', gematria: 528, mantra: 'OM', icon: Piano, color: '#9333EA' },
];

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  onOpenFeedback: () => void;
}

export default function SidebarNav({ activeSection, onSectionChange, onOpenFeedback }: SidebarNavProps) {
  return (
    <nav className="w-64 h-full min-h-screen border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8 px-2 py-4 border-b border-white/5">
        <div className="p-2 bg-white/5 rounded-full border border-white/10 shadow-sm">
          <Sparkles className="w-5 h-5 text-orange-500" />
        </div>
        <h1 className="text-xl font-serif italic tracking-tight">AllIsOne</h1>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isActive 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
              style={isActive ? { borderLeft: `3px solid ${item.color}` } : undefined}
            >
              <Icon className="w-5 h-5" style={isActive ? { color: item.color } : undefined} />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-[10px] opacity-60 font-mono">
                  {item.mantra} • SUM {item.gematria}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        <button
          onClick={onOpenFeedback}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-left text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Send Feedback</span>
        </button>
      </div>
    </nav>
  )
}
