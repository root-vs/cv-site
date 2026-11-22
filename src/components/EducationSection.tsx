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
    setExpandedIds((prev) => {
      const next = !prev[id];
      onFocusNode(next ? nodeId : 'edu-msc');
      return { ...prev, [id]: next };
    });
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
        className="border-b border-white/12 pb-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-teal-300 sm:text-lg">
            {EDUCATION_DEGREES.msc.degree}
          </h3>
          <span className="font-mono-tabular text-xs text-slate-400">
            {EDUCATION_DEGREES.msc.period}
          </span>
        </div>

        <p className="mt-1 text-xs font-medium text-slate-300">
          {EDUCATION_DEGREES.msc.institution}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-200">
          <span className="font-semibold text-slate-100">Thesis: </span>
          <span className="italic text-slate-300">{EDUCATION_DEGREES.msc.thesis}</span>
        </p>

        <p className="mt-2 text-xs text-slate-400">
          <span className="font-semibold text-teal-300/90">Skills: </span>
          {EDUCATION_DEGREES.msc.skills.join(' · ')}
        </p>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Main Projects (Click to Inspect Cube)
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="cursor-pointer whitespace-nowrap shrink-0 border-b border-teal-300/60 pb-0.5 text-xs font-medium text-teal-300 transition-colors hover:border-teal-200 hover:text-teal-200"
            >
              {allExpanded ? 'Collapse all' : 'Show all details'}
            </button>
          </div>

          <ul className="divide-y divide-white/10">
            {projects.map((proj) => {
              const isOpen = Boolean(expandedIds[proj.id]);
              return (
                <li key={proj.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSingle(proj.id, proj.nodeId)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-xs font-medium text-slate-200 transition-colors hover:text-teal-200 sm:text-sm"
                  >
                    <span>{proj.title}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-teal-300" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
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
                        <div className="mt-2.5 text-xs leading-relaxed text-slate-300">
                          <p>{proj.summary}</p>
                          {proj.bullets && (
                            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate-400">
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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-teal-300">
            {EDUCATION_DEGREES.bsc.degree}
          </h3>
          <span className="font-mono-tabular text-xs text-slate-400">
            {EDUCATION_DEGREES.bsc.period}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-300">
          {EDUCATION_DEGREES.bsc.institution}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          <span className="font-semibold text-slate-100">Thesis: </span>
          <span className="italic text-slate-300">{EDUCATION_DEGREES.bsc.thesis}</span>
        </p>
        <p className="mt-1.5 text-xs text-slate-400">
          <span className="font-semibold text-teal-300/90">Skills: </span>
          {EDUCATION_DEGREES.bsc.skills.join(' · ')}
        </p>
      </button>
    </motion.div>
  );
}
