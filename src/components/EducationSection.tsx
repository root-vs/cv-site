import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EDUCATION_DEGREES } from '../data/cvVault';
import { staggerItemVariants } from './StorySection';

interface EducationSectionProps {
  onFocusNode: (nodeId: string) => void;
}

export function EducationSection({ onFocusNode }: EducationSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const projects = EDUCATION_DEGREES.msc.projects;

  const allExpanded = projects.every((p) => Boolean(expandedIds[p.id]));

  const toggleSingle = (id: string, nodeId: string) => {
    const next = !expandedIds[id];
    setExpandedIds((prev) => ({ ...prev, [id]: next }));
    onFocusNode(next ? nodeId : 'edu-msc');
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds({});
      onFocusNode('edu-msc');
    } else {
      const next: Record<string, boolean> = {};
      projects.forEach((p) => {
        next[p.id] = true;
      });
      setExpandedIds(next);
      onFocusNode('edu-msc');
    }
  };

  return (
    <motion.div variants={staggerItemVariants} className="space-y-6">
      {/* Master's Degree Monograph */}
      <div
        onMouseEnter={() => onFocusNode('edu-msc')}
        className="border-b border-zinc-950/15 pb-6 dark:border-white/12"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-base font-semibold text-emerald-800 dark:text-emerald-300 sm:text-lg">
            {EDUCATION_DEGREES.msc.degree}
          </h3>
          <span className="font-mono-tabular shrink-0 text-xs text-zinc-600 dark:text-slate-400">
            {EDUCATION_DEGREES.msc.period}
          </span>
        </div>

        <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-slate-300">
          {EDUCATION_DEGREES.msc.institution}
        </p>

        <p className="mt-3 text-[13px] leading-relaxed text-zinc-900 dark:text-slate-200 sm:text-sm">
          <span className="font-semibold text-zinc-950 dark:text-slate-100">Thesis: </span>
          <span className="italic text-zinc-700 dark:text-slate-300">
            {EDUCATION_DEGREES.msc.thesis}
          </span>
        </p>

        <p className="mt-2 text-xs text-zinc-600 dark:text-slate-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300/90">
            Skills:{' '}
          </span>
          {EDUCATION_DEGREES.msc.skills.join(' · ')}
        </p>

        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-slate-300 sm:text-xs">
              Main Projects (Click to Inspect Cube)
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="cursor-pointer whitespace-nowrap shrink-0 border-b border-emerald-800/60 pb-0.5 text-xs font-medium text-emerald-800 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-emerald-300/60 dark:text-emerald-300 dark:hover:border-emerald-200 dark:hover:text-emerald-200"
            >
              {allExpanded ? 'Collapse all' : 'Show all details'}
            </button>
          </div>

          <ul className="divide-y divide-zinc-950/10 dark:divide-white/10">
            {projects.map((proj) => {
              const isOpen = Boolean(expandedIds[proj.id]);
              return (
                <li key={proj.id} className="py-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSingle(proj.id, proj.nodeId)}
                    aria-expanded={isOpen}
                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 py-1 text-left text-xs font-medium text-zinc-900 transition-colors hover:text-emerald-800 dark:text-slate-200 dark:hover:text-emerald-200 sm:text-sm"
                  >
                    <span>{proj.title}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 dark:text-slate-400" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 text-xs leading-relaxed text-zinc-700 dark:text-slate-300">
                          <p>{proj.summary}</p>
                          {proj.bullets && (
                            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-zinc-600 dark:text-slate-400">
                              {proj.bullets.map((b, bi) => (
                                <li key={bi}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bachelor's Degree */}
      <button
        type="button"
        onClick={() => onFocusNode('edu-bsc')}
        onMouseEnter={() => onFocusNode('edu-bsc')}
        className="block w-full cursor-pointer text-left transition-opacity hover:opacity-100"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-base font-semibold text-emerald-800 dark:text-emerald-300">
            {EDUCATION_DEGREES.bsc.degree}
          </h3>
          <span className="font-mono-tabular shrink-0 text-xs text-zinc-600 dark:text-slate-400">
            {EDUCATION_DEGREES.bsc.period}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-slate-300">
          {EDUCATION_DEGREES.bsc.institution}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-900 dark:text-slate-200 sm:text-sm">
          <span className="font-semibold text-zinc-950 dark:text-slate-100">Thesis: </span>
          <span className="italic text-zinc-700 dark:text-slate-300">
            {EDUCATION_DEGREES.bsc.thesis}
          </span>
        </p>
        <p className="mt-1.5 text-xs text-zinc-600 dark:text-slate-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300/90">
            Skills:{' '}
          </span>
          {EDUCATION_DEGREES.bsc.skills.join(' · ')}
        </p>
      </button>
    </motion.div>
  );
}
