import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EDUCATION_DEGREES } from '../data/cvVault';
import { staggerItemVariants } from './StorySection';

interface ProjectsSectionProps {
  onFocusNode: (nodeId: string) => void;
}

export function ProjectsSection({ onFocusNode }: ProjectsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const projects = EDUCATION_DEGREES.msc.projects;

  const allExpanded = projects.every((p) => Boolean(expandedIds[p.id]));

  const toggleSingle = (id: string, nodeId: string) => {
    const next = !expandedIds[id];
    setExpandedIds((prev) => ({ ...prev, [id]: next }));
    onFocusNode(next ? nodeId : projects[0].nodeId);
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds({});
      onFocusNode(projects[0].nodeId);
    } else {
      const next: Record<string, boolean> = {};
      projects.forEach((p) => {
        next[p.id] = true;
      });
      setExpandedIds(next);
      onFocusNode(projects[0].nodeId);
    }
  };

  return (
    <motion.div variants={staggerItemVariants} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-950/15 pb-3 dark:border-white/12">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-slate-300 sm:text-xs">
          M.Sc. Research &amp; Engineering Labs (Click to Inspect Cube)
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="cursor-pointer whitespace-nowrap shrink-0 border-b border-lime-800/60 pb-0.5 text-xs font-medium text-lime-800 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-lime-300/60 dark:text-lime-300 dark:hover:border-lime-200 dark:hover:text-lime-200"
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
                onMouseEnter={() => onFocusNode(proj.nodeId)}
                aria-expanded={isOpen}
                className="flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 py-1 text-left text-xs font-medium text-zinc-900 transition-colors hover:text-lime-800 dark:text-slate-200 dark:hover:text-lime-200 sm:text-sm"
              >
                <span>{proj.title}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-lime-800 dark:text-lime-300" />
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
                    <div className="pb-3 text-xs leading-relaxed text-zinc-700 dark:text-slate-300 sm:text-[13px]">
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
    </motion.div>
  );
}
