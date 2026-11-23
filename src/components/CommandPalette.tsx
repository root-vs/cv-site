import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Mail,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ASSETS,
  CUBE_PIECES,
  CubePieceNode,
} from '../data/cvVault';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPiece: (piece: CubePieceNode) => void;
  onOpenContact: () => void;
  onToggleCube: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectPiece,
  onOpenContact,
  onToggleCube,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CUBE_PIECES;
    return CUBE_PIECES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.chapterId.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        (n.meta && n.meta.toLowerCase().includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredPieces.length === 0 ? 0 : (prev + 1) % filteredPieces.length
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredPieces.length === 0
            ? 0
            : (prev - 1 + filteredPieces.length) % filteredPieces.length
        );
      } else if (e.key === 'Enter' && filteredPieces[selectedIndex]) {
        e.preventDefault();
        onSelectPiece(filteredPieces[selectedIndex]);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, filteredPieces, selectedIndex, onClose, onSelectPiece]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CV Cube Sections Command Palette"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/60 px-3 pt-[6vh] dark:bg-black/80 sm:px-4 sm:pt-[12vh]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-950/15 bg-white shadow-2xl dark:border-white/15 dark:bg-[#080d12]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-950/10 px-4 py-3.5 dark:border-white/10">
          <Search className="h-4 w-4 shrink-0 text-zinc-950 dark:text-teal-300" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search sections, skills, experience, research, films..."
            className="w-full min-w-0 bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-950/8 hover:text-zinc-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto border-b border-zinc-950/10 bg-zinc-50 px-4 py-2.5 dark:border-white/10 dark:bg-[#05090d] sm:flex-wrap">
          <a
            href={ASSETS.cvPdf}
            download="Valerio_Serino_CV_Resume.pdf"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF Resume</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/15 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
          >
            <Mail className="h-3.5 w-3.5 text-zinc-800 dark:text-teal-300" />
            <span>Contact Coordinates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleCube();
              onClose();
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/15 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-teal-300" />
            <span>Toggle Cube Split</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filteredPieces.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-slate-400">
              No cube sections match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredPieces.map((piece, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li key={piece.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        onSelectPiece(piece);
                        onClose();
                      }}
                      className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-zinc-950/8 ring-1 ring-zinc-950/25 dark:bg-teal-400/12 dark:ring-teal-300/35'
                          : 'hover:bg-zinc-950/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-zinc-950/15 dark:ring-white/15"
                            style={{ backgroundColor: piece.tonalColor }}
                          />
                          <span className="truncate text-sm font-medium text-zinc-950 dark:text-slate-100">
                            {piece.title}
                          </span>
                          <span className="shrink-0 text-xs text-zinc-500 dark:text-slate-500">
                            · {piece.chapterId}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 pl-4 text-xs text-zinc-600 dark:text-slate-400">
                          {piece.summary}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 dark:text-slate-400" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-950/10 bg-zinc-50 px-4 py-2 text-[11px] text-zinc-600 dark:border-white/10 dark:bg-[#05090d] dark:text-slate-500">
          <span className="truncate">↑↓ Navigate · Enter to inspect cubetto</span>
          <span className="font-mono-tabular shrink-0">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
