import { motion } from 'motion/react';
import { CHAPTERS, ChapterId } from '../data/cvVault';

interface RightNavRailProps {
  activeChapter: ChapterId;
  onSelectChapter: (id: ChapterId) => void;
}

export function RightNavRail({ activeChapter, onSelectChapter }: RightNavRailProps) {
  return (
    <nav
      aria-label="CV Chapter Rail"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {CHAPTERS.map((chapter) => {
        const isActive = chapter.id === activeChapter;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectChapter(chapter.id)}
            aria-label={`Jump to ${chapter.label}`}
            aria-current={isActive ? 'step' : undefined}
            className="group flex cursor-pointer items-center gap-3 py-0.5 text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
          >
            <span
              className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? 'text-teal-200'
                  : 'text-slate-500 opacity-70 group-hover:text-slate-200 group-hover:opacity-100'
              }`}
            >
              {chapter.label}
            </span>

            <motion.span
              animate={{
                width: isActive ? 28 : 12,
                backgroundColor: isActive ? '#5eead4' : 'rgba(148, 163, 184, 0.35)',
                boxShadow: isActive
                  ? '0 0 10px rgba(94, 234, 212, 0.9), 0 0 22px rgba(94, 234, 212, 0.45)'
                  : '0 0 0px rgba(94, 234, 212, 0)',
              }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="block h-[2px] rounded-full"
            />
          </button>
        );
      })}
    </nav>
  );
}
