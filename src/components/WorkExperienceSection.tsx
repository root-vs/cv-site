import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  EXPERIENCE_PHASES,
  WORK_EXPERIENCE_COMPANY,
} from '../data/cvVault';
import { staggerItemVariants } from './StorySection';

interface WorkExperienceSectionProps {
  onFocusNode: (nodeId: string) => void;
}

export function WorkExperienceSection({ onFocusNode }: WorkExperienceSectionProps) {
  const [activePhaseId, setActivePhaseId] = useState<string>(EXPERIENCE_PHASES[0].id);

  const activePhase =
    EXPERIENCE_PHASES.find((p) => p.id === activePhaseId) || EXPERIENCE_PHASES[0];

  const handleSelectPhase = (phaseId: string, nodeId: string) => {
    setActivePhaseId(phaseId);
    onFocusNode(nodeId);
  };

  return (
    <motion.div variants={staggerItemVariants} className="space-y-5">
      <p className="text-sm font-medium text-teal-200/85">
        {WORK_EXPERIENCE_COMPANY}
      </p>

      {/* Architectural Sliding Timeline Selector */}
      <div
        role="tablist"
        aria-label="Sytel Reply career milestones"
        className="no-scrollbar flex flex-nowrap gap-5 overflow-x-auto border-b border-white/12 pb-1 sm:gap-7"
      >
        {EXPERIENCE_PHASES.map((phase) => {
          const isSelected = phase.id === activePhase.id;
          return (
            <button
              key={phase.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleSelectPhase(phase.id, phase.nodeId)}
              className={`relative cursor-pointer whitespace-nowrap shrink-0 pb-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 ${
                isSelected ? 'text-teal-200' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <div className="text-xs font-semibold sm:text-sm">{phase.shortLabel}</div>
              <div className="font-mono-tabular mt-0.5 text-[11px] text-slate-400">
                {phase.period}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="exp-phase-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.85)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Unboxed Hairline Achievements Feed */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 pt-1"
        >
          <ul className="divide-y divide-white/10">
            {activePhase.activities.map((activity, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="py-2.5 first:pt-1 last:pb-0 sm:py-3.5"
              >
                <p className="text-[13px] leading-relaxed text-slate-100 sm:text-sm">
                  {activity.description}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  <span className="font-medium text-teal-300/90">Stack: </span>
                  {activity.skills.join(' · ')}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
