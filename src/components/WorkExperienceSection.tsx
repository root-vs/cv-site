import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CHAPTER_PALETTES,
  EXPERIENCE_PHASES,
  WORK_EXPERIENCE_COMPANY,
} from '../data/cvVault';
import type { CubeThemeMode } from './ObsidianBrainCanvas';
import { staggerItemVariants } from './StorySection';

interface WorkExperienceSectionProps {
  onFocusNode: (nodeId: string) => void;
  theme?: CubeThemeMode;
}

export function WorkExperienceSection({
  onFocusNode,
  theme = 'obsidian',
}: WorkExperienceSectionProps) {
  const [activePhaseId, setActivePhaseId] = useState<string>(EXPERIENCE_PHASES[0].id);
  const isLight = theme === 'light';
  const accentHex = isLight
    ? CHAPTER_PALETTES.experience.lightInk
    : CHAPTER_PALETTES.experience.obsidian;

  const activePhase =
    EXPERIENCE_PHASES.find((p) => p.id === activePhaseId) || EXPERIENCE_PHASES[0];

  const handleSelectPhase = (phaseId: string, nodeId: string) => {
    setActivePhaseId(phaseId);
    onFocusNode(nodeId);
  };

  return (
    <motion.div variants={staggerItemVariants} className="space-y-5">
      <p className="text-sm font-medium text-teal-800 dark:text-teal-200/85">
        {WORK_EXPERIENCE_COMPANY}
      </p>

      {/* Architectural Sliding Timeline Selector */}
      <div
        role="tablist"
        aria-label="Sytel Reply career milestones"
        className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto border-b border-zinc-950/15 pb-1 dark:border-white/12 sm:gap-7"
      >
        {EXPERIENCE_PHASES.map((phase) => {
          const isSelected = phase.id === activePhase.id;
          return (
            <button
              key={phase.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleSelectPhase(phase.id, phase.nodeId)}
              className={`relative cursor-pointer whitespace-nowrap shrink-0 pb-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-teal-300 ${
                isSelected
                  ? 'text-zinc-950 dark:text-teal-200'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <div className="text-xs font-semibold sm:text-sm">{phase.shortLabel}</div>
              <div className="font-mono-tabular mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
                {phase.period}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="exp-phase-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{
                    backgroundColor: accentHex,
                    boxShadow: isLight ? 'none' : `0 0 12px ${accentHex}d9`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed-Min-Height Wrapper: tab switches never resize or shift the menu/header above */}
      <div className="min-h-[555px] sm:min-h-[455px] lg:min-h-[430px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 pt-1"
          >
            <ul className="divide-y divide-zinc-950/10 dark:divide-white/10">
              {activePhase.activities.map((activity, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.035, duration: 0.28 }}
                  className="py-2.5 first:pt-1 last:pb-0 sm:py-3.5"
                >
                  <p className="text-[13px] leading-relaxed text-zinc-900 dark:text-slate-100 sm:text-sm">
                    {activity.description}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">
                    <span className="font-semibold text-teal-800 dark:text-teal-300/90">
                      Stack:{' '}
                    </span>
                    {activity.skills.join(' · ')}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
