import { useState } from 'react';
import { motion } from 'motion/react';
import { EDUCATION_DEGREES } from '../data/cvVault';
import { staggerItemVariants } from './StorySection';

interface EducationSectionProps {
  onFocusNode: (nodeId: string) => void;
}

export function EducationSection({ onFocusNode }: EducationSectionProps) {
  const [selectedDegree, setSelectedDegree] = useState<'msc' | 'bsc'>('msc');

  const handleSelect = (degree: 'msc' | 'bsc', nodeId: string) => {
    setSelectedDegree(degree);
    onFocusNode(nodeId);
  };

  return (
    <motion.div variants={staggerItemVariants} className="space-y-6">
      {/* Master's Degree */}
      <button
        type="button"
        onClick={() => handleSelect('msc', 'edu-msc')}
        onMouseEnter={() => handleSelect('msc', 'edu-msc')}
        className={`block w-full cursor-pointer border-b border-zinc-950/15 pb-6 text-left transition-opacity dark:border-white/12 ${
          selectedDegree === 'msc' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
        }`}
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

        <p className="mt-2.5 text-xs text-zinc-600 dark:text-slate-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300/90">
            Focus:{' '}
          </span>
          {EDUCATION_DEGREES.msc.skills.join(' · ')}
        </p>
      </button>

      {/* Bachelor's Degree */}
      <button
        type="button"
        onClick={() => handleSelect('bsc', 'edu-bsc')}
        onMouseEnter={() => handleSelect('bsc', 'edu-bsc')}
        className={`block w-full cursor-pointer text-left transition-opacity ${
          selectedDegree === 'bsc' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-base font-semibold text-emerald-800 dark:text-emerald-300 sm:text-lg">
            {EDUCATION_DEGREES.bsc.degree}
          </h3>
          <span className="font-mono-tabular shrink-0 text-xs text-zinc-600 dark:text-slate-400">
            {EDUCATION_DEGREES.bsc.period}
          </span>
        </div>

        <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-slate-300">
          {EDUCATION_DEGREES.bsc.institution}
        </p>

        <p className="mt-3 text-[13px] leading-relaxed text-zinc-900 dark:text-slate-200 sm:text-sm">
          <span className="font-semibold text-zinc-950 dark:text-slate-100">Thesis: </span>
          <span className="italic text-zinc-700 dark:text-slate-300">
            {EDUCATION_DEGREES.bsc.thesis}
          </span>
        </p>

        <p className="mt-2.5 text-xs text-zinc-600 dark:text-slate-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300/90">
            Focus:{' '}
          </span>
          {EDUCATION_DEGREES.bsc.skills.join(' · ')}
        </p>
      </button>
    </motion.div>
  );
}
