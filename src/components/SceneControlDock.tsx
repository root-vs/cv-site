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
    <div className="fixed bottom-2.5 left-1/2 z-30 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-col items-center sm:bottom-4 sm:max-w-[calc(100vw-2rem)]">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mb-1 inline-flex cursor-pointer items-center gap-1.5 rounded-t-lg border border-b-0 border-white/10 bg-[#080d12]/92 px-3 py-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-teal-200 sm:py-1"
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
        <div className="flex flex-nowrap items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#080d12]/94 px-2.5 py-1.5 shadow-2xl sm:gap-3 sm:px-3.5 sm:py-2">
          <div className="flex min-w-0 items-center gap-1.5 border-r border-white/10 pr-2 sm:gap-2 sm:pr-3">
            <Box className="h-3.5 w-3.5 shrink-0" style={{ color: pieceColor }} />
            <span className="max-w-[96px] truncate text-[11px] font-medium text-slate-200 sm:max-w-[205px] sm:text-xs">
              {cubeExploded ? activePiece.title : '3×3×3 Hero Cube'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCube}
            aria-label={cubeExploded ? 'Assemble Cube' : 'Break Cube'}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200 sm:px-2.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span className="hidden sm:inline">
              {cubeExploded ? 'Assemble Cube' : 'Break Cube'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleAutoOrbit}
            aria-label={autoOrbit ? 'Pause Spin' : 'Auto Spin'}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200 sm:px-2.5"
          >
            {autoOrbit ? (
              <>
                <Pause className="h-3.5 w-3.5 text-teal-300" />
                <span className="hidden sm:inline">Pause Spin</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-teal-300" />
                <span className="hidden sm:inline">Auto Spin</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute tactile sound' : 'Enable tactile sound'}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200 sm:px-2.5"
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
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200 sm:px-2.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
