'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Music, Library, Sliders, Edit3, MessageSquare, Sparkles, Piano } from 'lucide-react';

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

interface SacredGeometryNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function SacredGeometryNav({ activeSection, onSectionChange }: SacredGeometryNavProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const radius = 120;
  const innerRadius = 40;
  const centerX = 150;
  const centerY = 150;

  return (
    <nav aria-label="Main Navigation" className="relative w-[300px] h-[300px] flex items-center justify-center select-none">
      {/* Background Sacred Geometry Pattern (Flower of Life) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 300 300" className="w-full h-full stroke-white fill-none">
          <circle cx="150" cy="150" r="50" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <circle
              key={angle}
              cx={150 + 50 * Math.cos((angle * Math.PI) / 180)}
              cy={150 + 50 * Math.sin((angle * Math.PI) / 180)}
              r="50"
            />
          ))}
        </svg>
      </div>

      {/* The Radial Menu (Pie Chart) */}
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        {NAV_ITEMS.map((item, index) => {
          const sliceAngle = 360 / NAV_ITEMS.length;
          const startAngle = index * sliceAngle - 90;
          const endAngle = (index + 1) * sliceAngle - 90;
          
          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
          
          const ix1 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
          const iy1 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
          const ix2 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
          const iy2 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);

          const isActive = activeSection === item.id;
          const isItemHovered = isHovered === item.id;

          return (
            <g
              key={item.id}
              className="cursor-pointer group outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
              onClick={() => onSectionChange(item.id)}
              onMouseEnter={() => setIsHovered(item.id)}
              onMouseLeave={() => setIsHovered(null)}
              onFocus={() => setIsHovered(item.id)}
              onBlur={() => setIsHovered(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSectionChange(item.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.path
                d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 0 0 ${ix1} ${iy1}`}
                fill={isActive ? item.color : 'rgba(255,255,255,0.05)'}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                initial={false}
                animate={{
                  fill: isActive ? item.color : isItemHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  scale: isItemHovered || isActive ? 1.05 : 1,
                  opacity: isActive ? 0.8 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              
              {/* Text Labels along the arc */}
              <text
                x={centerX + (radius + 20) * Math.cos(((startAngle + sliceAngle / 2) * Math.PI) / 180)}
                y={centerY + (radius + 20) * Math.sin(((startAngle + sliceAngle / 2) * Math.PI) / 180)}
                textAnchor="middle"
                className="fill-white/60 text-[10px] font-mono uppercase tracking-widest"
                style={{ fontSize: '8px' }}
              >
                {item.mantra}
              </text>
            </g>
          );
        })}

        {/* Central Core */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          className="fill-black/40 stroke-white/20"
          strokeWidth="1"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-[10px] font-serif italic"
        >
          AllIsOne
        </text>
      </svg>

      {/* Floating Info Labels */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-12 flex flex-col items-center text-center"
          >
            <span className="text-xs font-mono text-white/40 tracking-[0.3em]">
              SUM: {NAV_ITEMS.find(n => n.id === isHovered)?.gematria}
            </span>
            <span className="text-sm font-serif italic text-white">
              {NAV_ITEMS.find(n => n.id === isHovered)?.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
