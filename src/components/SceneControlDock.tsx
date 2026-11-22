import { useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CATEGORY_COLORS, CUBE_PIECES } from '../data/cvVault';

interface SceneControlDockProps {
  activeNodeId: string;
  autoOrbit: boolean;
  onToggleAutoOrbit: () => void;
  cubeExploded: boolean;
  onToggleCube: () => void;
  onResetView: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function SceneControlDock({
  activeNodeId,
  autoOrbit,
  onToggleAutoOrbit,
  cubeExploded,
  onToggleCube,
  onResetView,
  soundEnabled,
  onToggleSound,
}: SceneControlDockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activePiece = CUBE_PIECES.find((p) => p.id === activeNodeId) || CUBE_PIECES[0];
  const pieceColor = CATEGORY_COLORS[activePiece.category];

  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mb-1 inline-flex cursor-pointer items-center gap-1.5 rounded-t-lg border border-b-0 border-white/10 bg-[#080d12]/92 px-3 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-teal-200"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            <span>3D Cube Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#080d12]/94 px-3.5 py-2 shadow-2xl sm:flex-nowrap sm:gap-3">
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            <Box className="h-3.5 w-3.5 shrink-0" style={{ color: pieceColor }} />
            <span className="max-w-[165px] truncate text-xs font-medium text-slate-200 sm:max-w-[205px]">
              {cubeExploded ? activePiece.title : '3×3×3 Hero Cube'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCube}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span>{cubeExploded ? 'Assemble Cube' : 'Break Cube'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleAutoOrbit}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            {autoOrbit ? (
              <>
                <Pause className="h-3.5 w-3.5 text-teal-300" />
                <span>Pause Spin</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-teal-300" />
                <span>Auto Spin</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute tactile sound' : 'Enable tactile sound'}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-teal-300" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'SFX On' : 'SFX Off'}</span>
          </button>

          <button
            type="button"
            onClick={onResetView}
            aria-label="Reset 3D camera"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
