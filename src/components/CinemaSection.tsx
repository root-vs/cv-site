import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Play, Pause, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CINEMA_FILMS, CinemaFilm } from '../data/cvVault';
import { staggerItemVariants } from './StorySection';

interface CinemaSectionProps {
  onFocusNode: (nodeId: string) => void;
}

export function CinemaSection({ onFocusNode }: CinemaSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [modalFilm, setModalFilm] = useState<CinemaFilm | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeFilm = CINEMA_FILMS[activeIndex];

  const selectFilm = (idx: number) => {
    const normalized = (idx + CINEMA_FILMS.length) % CINEMA_FILMS.length;
    setActiveIndex(normalized);
    setIsPlayingPreview(true);
    onFocusNode(CINEMA_FILMS[normalized].nodeId);
  };

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;
    if (isPlayingPreview && !modalFilm) {
      video.play().catch(() => {
        // Autoplay might be blocked before interaction; keep UI consistent
      });
    } else {
      video.pause();
    }
  }, [activeIndex, isPlayingPreview, modalFilm]);

  useEffect(() => {
    if (!modalFilm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalFilm(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalFilm]);

  return (
    <motion.div variants={staggerItemVariants} className="space-y-4">
      {/* Film Selector Tabs + Carousel Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080d12]/92 p-1">
          {CINEMA_FILMS.map((film, idx) => {
            const selected = idx === activeIndex;
            return (
              <button
                key={film.id}
                type="button"
                onClick={() => selectFilm(idx)}
                className={`cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  selected
                    ? 'bg-teal-400/18 text-teal-200 ring-1 ring-teal-300/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                {film.title} · {film.year}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => selectFilm(activeIndex - 1)}
            aria-label="Previous film"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#090f15]/92 text-slate-300 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono-tabular text-xs text-slate-400">
            0{activeIndex + 1} / 0{CINEMA_FILMS.length}
          </span>
          <button
            type="button"
            onClick={() => selectFilm(activeIndex + 1)}
            aria-label="Next film"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#090f15]/92 text-slate-300 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Compact Interactive Carousel Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilm.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#090f15]/92 shadow-2xl"
        >
          <div className="grid grid-cols-1 items-stretch md:grid-cols-12">
            {/* Video Preview Surface */}
            <div className="relative bg-black md:col-span-7">
              <video
                ref={previewVideoRef}
                key={activeFilm.videoUrl}
                src={activeFilm.videoUrl}
                muted
                loop
                playsInline
                preload="metadata"
                className="aspect-video h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

              {/* Inline Video Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlayingPreview((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-black/75 px-3 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:border-teal-300/50 hover:text-teal-200"
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Play preview</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalFilm(activeFilm)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Watch fullscreen</span>
                </button>
              </div>
            </div>

            {/* Film Details & Tech Note */}
            <div className="flex flex-col justify-between p-5 sm:p-6 md:col-span-5">
              <div>
                <div className="text-xs font-medium text-teal-300">
                  {activeFilm.contest}
                </div>
                <h3 className="font-display mt-1 text-xl font-bold tracking-wide text-slate-50">
                  {activeFilm.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  {activeFilm.synopsis}
                </p>
              </div>

              <div className="mt-5 border-t border-white/10 pt-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Production Pipeline
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {activeFilm.techNote}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Fullscreen Modal Video Player */}
      {modalFilm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${modalFilm.title} fullscreen player`}
          onClick={() => setModalFilm(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#060a0e] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div>
                <h4 className="font-display text-sm font-semibold text-teal-300 sm:text-base">
                  {modalFilm.title}
                </h4>
                <p className="text-xs text-slate-400">{modalFilm.contest}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalFilm(null)}
                aria-label="Close video player"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <video
              src={modalFilm.videoUrl}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
            />
            <div className="px-5 py-3 text-xs text-slate-300">
              {modalFilm.techNote}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
