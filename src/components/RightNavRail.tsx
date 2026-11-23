import { motion } from 'motion/react';
import { CHAPTER_PALETTES, CHAPTERS, ChapterId } from '../data/cvVault';
import type { CubeThemeMode } from './ObsidianBrainCanvas';

interface RightNavRailProps {
  activeChapter: ChapterId;
  onSelectChapter: (id: ChapterId) => void;
  theme: CubeThemeMode;
}

export function RightNavRail({ activeChapter, onSelectChapter, theme }: RightNavRailProps) {
  const isLight = theme === 'light';

  return (
    <nav
      aria-label="CV Chapter Rail"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {CHAPTERS.map((chapter) => {
        const isActive = chapter.id === activeChapter;
        const palette = CHAPTER_PALETTES[chapter.id];
        const barColor = isLight ? palette.lightInk : palette.obsidian;

        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectChapter(chapter.id)}
            aria-label={`Jump to ${chapter.label}`}
            aria-current={isActive ? 'step' : undefined}
            className="group flex cursor-pointer items-center gap-3 py-0.5 text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-teal-300"
          >
            <span
              className={`whitespace-nowrap text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? 'font-semibold'
                  : 'text-zinc-500 opacity-75 group-hover:text-zinc-950 group-hover:opacity-100 dark:text-slate-500 dark:opacity-70 dark:group-hover:text-slate-200'
              }`}
              style={isActive ? { color: barColor } : undefined}
            >
              {chapter.label}
            </span>

            <motion.span
              animate={{
                width: isActive ? 28 : 12,
                backgroundColor: isActive
                  ? barColor
                  : isLight
                  ? 'rgba(24, 24, 27, 0.24)'
                  : 'rgba(148, 163, 184, 0.35)',
                boxShadow:
                  isActive && !isLight
                    ? `0 0 10px ${barColor}e6, 0 0 22px ${barColor}73`
                    : '0 0 0px rgba(0, 0, 0, 0)',
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
