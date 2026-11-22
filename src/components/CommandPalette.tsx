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
  CATEGORY_COLORS,
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 pt-[12vh]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#080d12] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-teal-300" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search sections, subsections, skills, experience, research, films..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#05090d] px-4 py-2.5">
          <a
            href={ASSETS.cvPdf}
            download="Valerio_Serino_CV_Resume.pdf"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
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
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <Mail className="h-3.5 w-3.5 text-teal-300" />
            <span>Contact Coordinates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleCube();
              onClose();
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span>Toggle Cube Split</span>
          </button>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {filteredPieces.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No cube sections match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredPieces.map((piece, idx) => {
                const isSelected = idx === selectedIndex;
                const dotColor = CATEGORY_COLORS[piece.category];
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
                          ? 'bg-teal-400/12 ring-1 ring-teal-300/35'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: dotColor }}
                          />
                          <span className="truncate text-sm font-medium text-slate-100">
                            {piece.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            · {piece.category}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 pl-4.5 text-xs text-slate-400">
                          {piece.summary}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-[#05090d] px-4 py-2 text-[11px] text-slate-500">
          <span>↑↓ Navigate · Enter to rotate cube &amp; jump</span>
          <span className="font-mono-tabular">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
