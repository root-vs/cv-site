import { useEffect, useRef, useState } from 'react';
import { Maximize2, Play, Pause, X } from 'lucide-react';
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
  const [failedLocalIds, setFailedLocalIds] = useState<Record<string, boolean>>({});
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeFilm = CINEMA_FILMS[activeIndex];
  const getFilmSrc = (film: CinemaFilm) =>
    failedLocalIds[film.id] && film.fallbackVideoUrl ? film.fallbackVideoUrl : film.videoUrl;
  const activeVideoSrc = getFilmSrc(activeFilm);

  const handleVideoError = (film: CinemaFilm) => {
    if (film.fallbackVideoUrl && !failedLocalIds[film.id]) {
      setFailedLocalIds((prev) => ({ ...prev, [film.id]: true }));
    }
  };

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
  }, [activeIndex, activeVideoSrc, isPlayingPreview, modalFilm]);

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
      {/* Film Selector Toggle */}
      <div className="flex items-center justify-start">
        <div className="no-scrollbar inline-flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-950/15 bg-white/90 p-1 dark:border-white/10 dark:bg-[#080d12]/92">
          {CINEMA_FILMS.map((film, idx) => {
            const selected = idx === activeIndex;
            return (
              <button
                key={film.id}
                type="button"
                onClick={() => selectFilm(idx)}
                className={`cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-200 sm:px-3.5 sm:text-xs ${
                  selected
                    ? 'bg-zinc-950 text-white dark:bg-pink-400/18 dark:text-pink-200 dark:ring-1 dark:ring-pink-300/45'
                    : 'text-zinc-600 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100'
                }`}
              >
                {film.title} · {film.year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Compact Interactive Carousel Card with locked minimum height */}
      <div className="min-h-[430px] sm:min-h-[450px] md:min-h-[305px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilm.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-zinc-950/15 bg-white shadow-xl dark:border-white/10 dark:bg-[#090f15]/92 dark:shadow-2xl"
          >
            <div className="grid grid-cols-1 items-stretch md:grid-cols-12">
              {/* Video Preview Surface */}
              <div className="relative bg-black md:col-span-7">
                <video
                  ref={previewVideoRef}
                  key={activeVideoSrc}
                  src={activeVideoSrc}
                  autoPlay={isPlayingPreview && !modalFilm}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onCanPlay={() => {
                    if (isPlayingPreview && !modalFilm) {
                      previewVideoRef.current?.play().catch(() => {});
                    }
                  }}
                  onError={() => handleVideoError(activeFilm)}
                  className="aspect-video h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

                {/* Inline Video Controls */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayingPreview((prev) => !prev)}
                    className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/20 bg-black/80 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:border-pink-300/60 hover:text-pink-200 sm:px-3 sm:text-xs"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                        <span className="hidden sm:inline">preview</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Play</span>
                        <span className="hidden sm:inline">preview</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFilm(activeFilm)}
                    className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-pink-400 dark:text-slate-950 dark:hover:bg-pink-300 sm:px-3.5 sm:text-xs"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Film Details & Tech Note */}
              <div className="flex flex-col justify-between p-4 sm:p-6 md:col-span-5">
                <div>
                  <div className="text-xs font-semibold text-pink-800 dark:text-pink-300">
                    {activeFilm.contest}
                  </div>
                  <h3 className="font-display mt-1 text-lg font-bold tracking-wide text-zinc-950 dark:text-slate-50 sm:text-xl">
                    {activeFilm.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-800 dark:text-slate-200 sm:mt-3 sm:text-sm">
                    {activeFilm.synopsis}
                  </p>
                </div>

                <div className="mt-4 border-t border-zinc-950/12 pt-3 dark:border-white/10 sm:mt-5 sm:pt-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                    Production Pipeline
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-slate-300">
                    {activeFilm.techNote}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fullscreen Modal Video Player */}
      {modalFilm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${modalFilm.title} fullscreen player`}
          onClick={() => setModalFilm(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-950/20 bg-white shadow-2xl dark:border-white/15 dark:bg-[#060a0e]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-950/10 px-4 py-3 dark:border-white/10 sm:px-5 sm:py-3.5">
              <div className="min-w-0">
                <h4 className="font-display truncate text-sm font-semibold text-pink-800 dark:text-pink-300 sm:text-base">
                  {modalFilm.title}
                </h4>
                <p className="truncate text-xs text-zinc-600 dark:text-slate-400">
                  {modalFilm.contest}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalFilm(null)}
                aria-label="Close video player"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-950/15 bg-zinc-100 text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <video
              key={getFilmSrc(modalFilm)}
              src={getFilmSrc(modalFilm)}
              controls
              autoPlay
              playsInline
              onError={() => handleVideoError(modalFilm)}
              className="aspect-video max-h-[66dvh] w-full bg-black object-contain"
            />
            <div className="shrink-0 px-4 py-2.5 text-xs text-zinc-700 dark:text-slate-300 sm:px-5 sm:py-3">
              {modalFilm.techNote}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
