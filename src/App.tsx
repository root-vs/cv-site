import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Moon,
  Phone,
  Search,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CinemaSection } from './components/CinemaSection';
import { CommandPalette } from './components/CommandPalette';
import { ContactModal } from './components/ContactModal';
import { EducationSection } from './components/EducationSection';
import { CubeThemeMode, ObsidianBrainCanvas } from './components/ObsidianBrainCanvas';
import { ProjectsSection } from './components/ProjectsSection';
import { RightNavRail } from './components/RightNavRail';
import { StorySection, staggerItemVariants } from './components/StorySection';
import { WorkExperienceSection } from './components/WorkExperienceSection';
import {
  ABOUT_CONTENT,
  ASSETS,
  CERTIFICATIONS,
  CHAPTER_PALETTES,
  CHAPTERS,
  CONTACT_INFO,
  ChapterId,
  CubePieceNode,
  EXECUTIVE_METRICS,
  PUBLICATION,
  SKILLS_GROUPS,
} from './data/cvVault';
import { soundEngine } from './utils/soundEngine';

const TYPED_GREETING = ABOUT_CONTENT.promptGreeting;

const CHAPTER_STAGE_SIDE: Record<ChapterId, 'right' | 'left' | 'center'> = {
  home: 'right',
  about: 'right',
  skills: 'left',
  experience: 'right',
  certifications: 'left',
  publications: 'right',
  education: 'left',
  projects: 'right',
  cinema: 'center',
  contact: 'center',
};

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [activeChapter, setActiveChapter] = useState<ChapterId>('home');
  const [activeNodeId, setActiveNodeId] = useState<string>('about-mindset');
  const [activeSkillGroupId, setActiveSkillGroupId] = useState<string>(SKILLS_GROUPS[1].id);
  const [activeCertProvider, setActiveCertProvider] = useState<string>(CERTIFICATIONS[0].nodeId);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [homeExitProgress, setHomeExitProgress] = useState(0);
  const [proximities, setProximities] = useState<Record<ChapterId, number>>({
    home: 1,
    about: 0,
    skills: 0,
    experience: 0,
    certifications: 0,
    publications: 0,
    education: 0,
    projects: 0,
    cinema: 0,
    contact: 0,
  });

  const [cubeManuallyExploded, setCubeManuallyExploded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<CubeThemeMode>(() => {
    try {
      return localStorage.getItem('vs-cube-theme') === 'light' ? 'light' : 'obsidian';
    } catch {
      return 'obsidian';
    }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [typedLength, setTypedLength] = useState(0);

  const activeChapterRef = useRef<ChapterId>(activeChapter);
  activeChapterRef.current = activeChapter;
  const lastArrowNavRef = useRef<{ index: number; timestamp: number }>({
    index: 0,
    timestamp: 0,
  });

  // Keep HTML root `.dark` class and localStorage synced with active theme
  useEffect(() => {
    const isObsidian = theme === 'obsidian';
    document.documentElement.classList.toggle('dark', isObsidian);
    try {
      localStorage.setItem('vs-cube-theme', theme);
    } catch {
      // Ignore storage failures in sandboxed contexts
    }
  }, [theme]);

  // Unlock procedural Web Audio synthesizer on first user gesture
  useEffect(() => {
    const unlockAudio = () => {
      soundEngine.unlock();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('wheel', unlockAudio, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('wheel', unlockAudio);
    };
  }, []);

  // Typing animation for hero Linux prompt
  useEffect(() => {
    let idx = 0;
    const timer = window.setInterval(() => {
      idx += 1;
      setTypedLength(idx);
      if (idx >= TYPED_GREETING.length) {
        window.clearInterval(timer);
      }
    }, 34);
    return () => window.clearInterval(timer);
  }, []);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Scroll listener for progress bar, cube explosion, and viewport proximity
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafPending = false;
    let lastBestChapter: ChapterId = 'home';

    const updateMetrics = () => {
      rafPending = false;
      const scrollTop = container.scrollTop;
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      setScrollProgress(progress);

      const vh = container.clientHeight || window.innerHeight;
      const exitRatio = Math.min(1, Math.max(0, scrollTop / (vh * 0.45)));
      setHomeExitProgress(exitRatio);

      if (scrollTop < vh * 0.08) {
        setCubeManuallyExploded(false);
      }

      const nextProx: Record<string, number> = {};
      let bestId: ChapterId = 'home';
      let bestProx = -1;
      const viewportCenter = vh / 2;

      for (const ch of CHAPTERS) {
        const el = sectionRefs.current[ch.id];
        if (!el) {
          nextProx[ch.id] = 0;
          continue;
        }
        const rect = el.getBoundingClientRect();
        let prox = 0;
        if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
          prox = 1;
        } else {
          const sectionCenter = rect.top + rect.height / 2;
          const dist = Math.abs(sectionCenter - viewportCenter);
          prox = Math.max(0, 1 - dist / (vh * 0.85));
        }
        nextProx[ch.id] = prox;
        if (prox > bestProx) {
          bestProx = prox;
          bestId = ch.id;
        }
      }

      setProximities(nextProx as Record<ChapterId, number>);
      if (bestId !== lastBestChapter) {
        lastBestChapter = bestId;
        setActiveChapter(bestId);
        const chMeta = CHAPTERS.find((c) => c.id === bestId);
        if (chMeta) {
          setActiveNodeId(chMeta.focusNodeId);
        }
      }
    };

    const onScroll = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateMetrics);
      }
    };

    updateMetrics();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToChapter = useCallback((chapterId: ChapterId, customNodeId?: string) => {
    const targetIdx = CHAPTERS.findIndex((c) => c.id === chapterId);
    if (targetIdx !== -1) {
      lastArrowNavRef.current = { index: targetIdx, timestamp: Date.now() };
    }
    const el = sectionRefs.current[chapterId];
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: window.innerWidth >= 768 ? 'center' : 'start',
      });
    }
    const chMeta = CHAPTERS.find((c) => c.id === chapterId);
    if (customNodeId) {
      setActiveNodeId(customNodeId);
    } else if (chMeta) {
      setActiveNodeId(chMeta.focusNodeId);
    }
  }, []);

  // Keyboard arrow navigation (Up/Left = backward, Down/Right = forward)
  useEffect(() => {
    const onArrowKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (paletteOpen || contactOpen || document.querySelector('[role="dialog"]')) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
      const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      if (!isNext && !isPrev) return;

      e.preventDefault();
      soundEngine.unlock();

      const now = Date.now();
      const baseIndex =
        now - lastArrowNavRef.current.timestamp < 750
          ? lastArrowNavRef.current.index
          : Math.max(
              0,
              CHAPTERS.findIndex((c) => c.id === activeChapterRef.current)
            );

      const nextIndex = isNext
        ? Math.min(CHAPTERS.length - 1, baseIndex + 1)
        : Math.max(0, baseIndex - 1);

      if (nextIndex !== baseIndex || now - lastArrowNavRef.current.timestamp >= 750) {
        scrollToChapter(CHAPTERS[nextIndex].id);
      }
    };

    window.addEventListener('keydown', onArrowKeyDown);
    return () => window.removeEventListener('keydown', onArrowKeyDown);
  }, [paletteOpen, contactOpen, scrollToChapter]);

  const handleSelectPiece = useCallback(
    (piece: CubePieceNode) => {
      setActiveNodeId(piece.id);
      if (piece.id.startsWith('skills-')) {
        setActiveSkillGroupId(piece.id);
      } else if (piece.id.startsWith('cert-')) {
        setActiveCertProvider(piece.id);
      }
      scrollToChapter(piece.chapterId, piece.id);
    },
    [scrollToChapter]
  );

  const handleToggleCube = useCallback(() => {
    setCubeManuallyExploded((prev) => !prev);
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.unlock();
      soundEngine.playCubettoClick();
    }
  }, [soundEnabled]);

  const handleToggleTheme = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playCubettoClick();
    setTheme((prev) => (prev === 'obsidian' ? 'light' : 'obsidian'));
  }, []);

  const isLightTheme = theme === 'light';
  const activePalette = CHAPTER_PALETTES[activeChapter];
  const progressBarColor = isLightTheme ? activePalette.lightInk : activePalette.obsidian;

  const activeSkillsGroup =
    SKILLS_GROUPS.find((g) => g.id === activeSkillGroupId) || SKILLS_GROUPS[1];
  const activeCertGroup =
    CERTIFICATIONS.find((c) => c.nodeId === activeCertProvider) || CERTIFICATIONS[0];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f4f4f5] text-zinc-950 transition-colors duration-300 dark:bg-[#04070a] dark:text-slate-100">
      {/* 3D Knowledge Cube Space */}
      <ObsidianBrainCanvas
        activeChapter={activeChapter}
        activeNodeId={activeNodeId}
        scrollProgress={scrollProgress}
        homeExitProgress={homeExitProgress}
        cubeManuallyExploded={cubeManuallyExploded}
        onToggleCubeExplode={handleToggleCube}
        onSelectPiece={handleSelectPiece}
        autoOrbit={true}
        resetSignal={0}
        stageSide={CHAPTER_STAGE_SIDE[activeChapter]}
        theme={theme}
      />

      {/* Top Reading Progress Bar synced to active chapter palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 h-[2.5px] bg-zinc-950/10 dark:bg-white/5"
      >
        <div
          className="h-full origin-left transition-all duration-150"
          style={{
            transform: `scaleX(${scrollProgress})`,
            backgroundColor: progressBarColor,
            boxShadow: isLightTheme ? 'none' : `0 0 12px ${progressBarColor}`,
          }}
        />
      </div>

      {/* Fixed 3-Zone Top Bar (stationary items, no layout shifts across theme/tab switches) */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-zinc-950/12 bg-white/92 px-3 py-2.5 transition-colors duration-300 dark:border-white/10 dark:bg-[#04070a]/90 sm:px-6 sm:py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => scrollToChapter('home')}
            className="font-display cursor-pointer whitespace-nowrap shrink-0 text-sm font-bold tracking-wider text-zinc-950 transition-colors hover:text-zinc-600 dark:text-slate-50 dark:hover:text-teal-300 sm:text-base"
          >
            Valerio Serino
          </button>

          {/* Compact navigation for medium / small-laptop screens */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-3.5 text-xs font-medium text-zinc-600 dark:text-slate-300 md:flex lg:gap-6 xl:hidden"
          >
            {(
              [
                ['about', 'About'],
                ['experience', 'Experience'],
                ['publications', 'Research'],
                ['cinema', 'AI Film'],
                ['contact', 'Contact'],
              ] as const
            ).map(([chId, label]) => {
              const isCurrent = activeChapter === chId;
              const chHex = isLightTheme
                ? CHAPTER_PALETTES[chId].lightInk
                : CHAPTER_PALETTES[chId].obsidian;
              return (
                <button
                  key={chId}
                  type="button"
                  onClick={() => scrollToChapter(chId)}
                  className="relative cursor-pointer whitespace-nowrap shrink-0 py-0.5 transition-colors hover:text-zinc-950 dark:hover:text-white"
                  style={isCurrent ? { color: chHex } : undefined}
                >
                  {label}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full"
                      style={{ backgroundColor: chHex }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Full chapter navigation mirroring the right-side rail on larger screens */}
          <nav
            aria-label="Full chapter navigation"
            className="hidden items-center gap-3.5 text-xs font-medium text-zinc-600 dark:text-slate-300 xl:flex 2xl:gap-5"
          >
            {CHAPTERS.map((chapter) => {
              const isCurrent = activeChapter === chapter.id;
              const chHex = isLightTheme
                ? CHAPTER_PALETTES[chapter.id].lightInk
                : CHAPTER_PALETTES[chapter.id].obsidian;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => scrollToChapter(chapter.id)}
                  className="relative cursor-pointer whitespace-nowrap shrink-0 py-0.5 transition-colors hover:text-zinc-950 dark:hover:text-white"
                  style={isCurrent ? { color: chHex } : undefined}
                >
                  {chapter.label}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full"
                      style={{ backgroundColor: chHex }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={
                isLightTheme
                  ? 'Switch to Dark mode'
                  : 'Switch to High-Contrast Light mode'
              }
              aria-pressed={isLightTheme}
              title={isLightTheme ? 'Light Mode (Active)' : 'Dark Mode (Active)'}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/15 bg-zinc-100 p-2 text-xs font-medium text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/12 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200 sm:px-2.5 sm:py-1.5"
            >
              {isLightTheme ? (
                <Sun className="h-3.5 w-3.5 text-zinc-950" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-teal-300" />
              )}
              <span className="hidden lg:inline">
                {isLightTheme ? 'Light' : 'Dark'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? 'Mute tactile sound' : 'Enable tactile sound'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? 'SFX On' : 'SFX Off'}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/15 bg-zinc-100 p-2 text-xs font-medium text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/12 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200 sm:px-2.5 sm:py-1.5"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-zinc-950 dark:text-teal-300" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-zinc-500 dark:text-slate-400" />
              )}
              <span className="hidden sm:inline md:hidden lg:inline">
                {soundEnabled ? 'SFX On' : 'SFX Off'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search and navigate cube"
              title="Navigate Cube"
              className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950 bg-zinc-950 p-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:border-teal-300/35 dark:bg-teal-400/12 dark:text-teal-200 dark:hover:bg-teal-400/22 sm:px-3.5 sm:py-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Navigate Cube</span>
            </button>
          </div>
        </div>
      </header>

      {/* Right-Edge Chapter Rail */}
      <RightNavRail
        activeChapter={activeChapter}
        onSelectChapter={(id) => scrollToChapter(id)}
        theme={theme}
      />

      {/* Scroll-Snap Story Container */}
      <main
        ref={scrollContainerRef}
        className="story-scroll-container relative z-10 h-[100dvh] w-full snap-y snap-proximity overflow-y-auto overflow-x-hidden scroll-smooth md:snap-mandatory"
      >
        {/* 00. HOME HERO */}
        <StorySection
          id="home"
          align="left"
          theme={theme}
          accentColor={CHAPTER_PALETTES.home.obsidian}
          lightAccentColor={CHAPTER_PALETTES.home.lightInk}
          isActive={activeChapter === 'home'}
          focusProximity={proximities.home}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.home = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-950/20 bg-zinc-200 shadow-lg dark:border-teal-300/40 dark:bg-[#070d12] dark:shadow-[0_0_25px_rgba(94,234,212,0.18)] sm:h-20 sm:w-20 md:h-24 md:w-24">
                <img
                  src={ASSETS.profileImage}
                  alt="Valerio Serino portrait"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-zinc-700 dark:text-teal-300 sm:text-xs">
                  Interactive 3D Knowledge Cube
                </p>
                <h1 className="font-display mt-1 text-[clamp(1.75rem,4.4vw,3.15rem)] leading-[1.1] font-bold tracking-tight text-balance text-zinc-950 dark:text-slate-50">
                  Valerio Serino
                </h1>
                <p className="mt-1.5 text-xs text-zinc-700 dark:text-slate-300 sm:text-sm md:text-base">
                  Senior IT Consultant · AI, Distributed Systems &amp; Security
                </p>
              </div>
            </div>

            {/* Sleek Terminal Prompt */}
            <div className="max-w-lg border-l-2 border-zinc-950 bg-white/90 px-3.5 py-2.5 font-mono-tabular text-xs text-zinc-900 shadow-xs dark:border-teal-300 dark:bg-[#070d12]/75 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm">
              <span className="mr-2 font-bold text-zinc-950 dark:text-teal-300">$</span>
              <span>{TYPED_GREETING.slice(0, typedLength)}</span>
              <span className="terminal-cursor ml-0.5 inline-block text-zinc-950 dark:text-teal-300">
                ▋
              </span>
            </div>

            {/* Clean CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={() => scrollToChapter('about')}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300 sm:px-5"
              >
                <span>Enter the Cube</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>

              <a
                href={ASSETS.cvPdf}
                download="Valerio_Serino_CV_Resume.pdf"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/20 bg-white/90 px-4 py-2.5 text-xs font-medium text-zinc-950 transition-colors hover:border-zinc-950 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-teal-300/45 dark:hover:text-teal-200 sm:px-5"
              >
                <Download className="h-3.5 w-3.5 text-zinc-950 dark:text-teal-300" />
                <span>PDF Resume</span>
              </a>
            </div>

            {/* Hairline KPI Strip */}
            <div className="grid grid-cols-1 divide-y divide-zinc-950/15 border-t border-zinc-950/15 pt-4 dark:divide-white/12 dark:border-white/12 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:pt-5">
              {EXECUTIVE_METRICS.map((metric, idx) => (
                <div
                  key={metric.id}
                  className={
                    idx === 0
                      ? 'pb-3 sm:pb-0 sm:pr-4'
                      : idx === 1
                      ? 'py-3 sm:px-4 sm:py-0'
                      : 'pt-3 sm:pl-4 sm:pt-0'
                  }
                >
                  <div
                    className="font-display font-mono-tabular whitespace-nowrap text-base font-bold sm:text-lg md:text-xl"
                    style={{ color: isLightTheme ? metric.lightAccent : metric.accent }}
                  >
                    {metric.value}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-slate-200 sm:mt-1">
                    {metric.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-600 dark:text-slate-400">
                    {metric.detail}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </StorySection>

        {/* 01. ABOUT */}
        <StorySection
          id="about"
          indexLabel="01"
          nodeLabel="Cube Impact · Mindset"
          title="About"
          align="left"
          theme={theme}
          accentColor={CHAPTER_PALETTES.about.obsidian}
          lightAccentColor={CHAPTER_PALETTES.about.lightInk}
          isActive={activeChapter === 'about'}
          focusProximity={proximities.about}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.about = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <blockquote className="font-display text-[clamp(1.25rem,2.6vw,1.9rem)] font-semibold leading-snug text-cyan-800 dark:text-cyan-300">
              &ldquo;{ABOUT_CONTENT.quote}&rdquo;
            </blockquote>
            <p className="text-sm leading-relaxed text-zinc-900 dark:text-slate-200 sm:text-base md:text-lg">
              {ABOUT_CONTENT.bio.replace(/ and one principle:$/, '.')}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-zinc-950/15 pt-4 text-xs font-medium tracking-wide text-zinc-600 dark:border-white/12 dark:text-slate-400">
              <span>AI &amp; Agents</span>
              <span aria-hidden="true">·</span>
              <span>Cybersecurity</span>
              <span aria-hidden="true">·</span>
              <span>Networks</span>
              <span aria-hidden="true">·</span>
              <span>Remote Sensing</span>
              <span aria-hidden="true">·</span>
              <span>Green Coding</span>
            </div>
          </motion.div>
        </StorySection>

        {/* 02. SKILLS (Cobalt Blue Parent · Locked Fixed Height across tabs) */}
        <StorySection
          id="skills"
          indexLabel="02"
          nodeLabel="Cube Impact · Capabilities"
          title="Skills"
          align="right"
          theme={theme}
          accentColor={CHAPTER_PALETTES.skills.obsidian}
          lightAccentColor={CHAPTER_PALETTES.skills.lightInk}
          isActive={activeChapter === 'skills'}
          focusProximity={proximities.skills}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.skills = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto border-b border-zinc-950/15 pb-3 dark:border-white/12 sm:flex-wrap sm:gap-2">
              {SKILLS_GROUPS.map((group) => {
                const isSelected = group.id === activeSkillsGroup.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setActiveSkillGroupId(group.id);
                      setActiveNodeId(group.id);
                    }}
                    className={`relative cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 ${
                      isSelected
                        ? 'text-white dark:text-slate-950'
                        : 'text-zinc-700 hover:bg-zinc-950/6 hover:text-zinc-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="skills-active-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-zinc-950 dark:bg-blue-400"
                      />
                    )}
                    <span className="relative z-10">{group.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Locked minimum height prevents tab bar & title from shifting vertically */}
            <div className="min-h-[260px] sm:min-h-[195px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSkillsGroup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-3"
                >
                  {activeSkillsGroup.items.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.025, duration: 0.24 }}
                      className="border-b border-zinc-950/12 pb-2 text-xs font-medium text-zinc-900 dark:border-white/10 dark:text-slate-100 sm:text-sm"
                    >
                      {item}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </StorySection>

        {/* 03. WORK EXPERIENCE (Deep Teal Parent) */}
        <StorySection
          id="experience"
          indexLabel="03"
          nodeLabel="Cube Impact · Career Trajectory"
          title="Work Experience"
          align="left"
          theme={theme}
          accentColor={CHAPTER_PALETTES.experience.obsidian}
          lightAccentColor={CHAPTER_PALETTES.experience.lightInk}
          isActive={activeChapter === 'experience'}
          focusProximity={proximities.experience}
          maxWidthClass="max-w-2xl"
          sectionRef={(el) => {
            sectionRefs.current.experience = el;
          }}
        >
          <WorkExperienceSection onFocusNode={(nid) => setActiveNodeId(nid)} theme={theme} />
        </StorySection>

        {/* 04. CERTIFICATIONS (Amethyst Violet Parent · Locked Fixed Height across tabs) */}
        <StorySection
          id="certifications"
          indexLabel="04"
          nodeLabel="Cube Impact · Verified Credentials"
          title="Certifications"
          align="right"
          theme={theme}
          accentColor={CHAPTER_PALETTES.certifications.obsidian}
          lightAccentColor={CHAPTER_PALETTES.certifications.lightInk}
          isActive={activeChapter === 'certifications'}
          focusProximity={proximities.certifications}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.certifications = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5">
            <div className="no-scrollbar flex flex-nowrap gap-5 overflow-x-auto border-b border-zinc-950/15 pb-3 dark:border-white/12 sm:gap-6">
              {CERTIFICATIONS.map((group) => {
                const isSelected = group.nodeId === activeCertGroup.nodeId;
                return (
                  <button
                    key={group.provider}
                    type="button"
                    onClick={() => {
                      setActiveCertProvider(group.nodeId);
                      setActiveNodeId(group.nodeId);
                    }}
                    className={`relative cursor-pointer whitespace-nowrap shrink-0 pb-1 text-xs font-semibold transition-colors sm:text-sm ${
                      isSelected
                        ? 'text-violet-800 dark:text-violet-300'
                        : 'text-zinc-600 hover:text-zinc-950 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <span>{group.provider}</span>
                    <span className="font-mono-tabular ml-2 text-xs text-zinc-500 dark:text-slate-500">
                      ({group.items.length})
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="cert-provider-line"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute -bottom-3 left-0 right-0 h-[2px] bg-violet-700 dark:bg-violet-400 dark:shadow-[0_0_10px_rgba(167,139,250,0.85)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[290px] sm:min-h-[250px]">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={activeCertGroup.nodeId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.24 }}
                  className="divide-y divide-zinc-950/10 dark:divide-white/10"
                >
                  {activeCertGroup.items.map((cert, idx) => (
                    <motion.li
                      key={cert}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.035 }}
                      className="py-2.5 text-xs text-zinc-900 dark:text-slate-100 sm:py-3 sm:text-sm"
                    >
                      <span>{cert}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </motion.div>
        </StorySection>

        {/* 05. PUBLICATIONS (Solar Amber Parent) */}
        <StorySection
          id="publications"
          indexLabel="05"
          nodeLabel="Cube Impact · Peer-Reviewed Research"
          title="Publications"
          align="left"
          theme={theme}
          accentColor={CHAPTER_PALETTES.publications.obsidian}
          lightAccentColor={CHAPTER_PALETTES.publications.lightInk}
          isActive={activeChapter === 'publications'}
          focusProximity={proximities.publications}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.publications = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-4 sm:space-y-5">
            <div className="font-display text-xs font-semibold tracking-widest text-amber-800 dark:text-amber-300">
              IEEE XPLORE · ICETCI 2021
            </div>
            <h3 className="text-[clamp(1.125rem,2.1vw,1.5rem)] font-semibold leading-snug text-zinc-950 dark:text-slate-50">
              {PUBLICATION.title}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-slate-400 sm:text-sm">
              {PUBLICATION.venue}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={PUBLICATION.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
              >
                <span>View Publication</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span className="text-xs text-zinc-600 dark:text-slate-400">
                Earth Observation · Multi-Agent Systems · Phenological Context
              </span>
            </div>
          </motion.div>
        </StorySection>

        {/* 06. EDUCATION (Master's & Bachelor's together · Emerald Green Parent) */}
        <StorySection
          id="education"
          indexLabel="06"
          nodeLabel="Cube Impact · Academic Foundations"
          title="Education"
          align="right"
          theme={theme}
          accentColor={CHAPTER_PALETTES.education.obsidian}
          lightAccentColor={CHAPTER_PALETTES.education.lightInk}
          isActive={activeChapter === 'education'}
          focusProximity={proximities.education}
          maxWidthClass="max-w-2xl"
          sectionRef={(el) => {
            sectionRefs.current.education = el;
          }}
        >
          <EducationSection onFocusNode={(nid) => setActiveNodeId(nid)} />
        </StorySection>

        {/* 07. UNIVERSITY MAIN PROJECTS (Dedicated Expandable Cube · Lime Parent) */}
        <StorySection
          id="projects"
          indexLabel="07"
          nodeLabel="Cube Impact · University Labs"
          title="Main Projects"
          align="left"
          theme={theme}
          accentColor={CHAPTER_PALETTES.projects.obsidian}
          lightAccentColor={CHAPTER_PALETTES.projects.lightInk}
          isActive={activeChapter === 'projects'}
          focusProximity={proximities.projects}
          maxWidthClass="max-w-2xl"
          sectionRef={(el) => {
            sectionRefs.current.projects = el;
          }}
        >
          <ProjectsSection onFocusNode={(nid) => setActiveNodeId(nid)} />
        </StorySection>

        {/* 08. CONTEST AZIENDALI / REPLY FILM FESTIVAL (Cinema Rose Parent) */}
        <StorySection
          id="cinema"
          indexLabel="08"
          nodeLabel="Cube Impact · Contest Aziendali"
          title="Reply Film Festival"
          subtitle="Experimental AI short films produced for the Reply AI Film Contest."
          align="center"
          theme={theme}
          accentColor={CHAPTER_PALETTES.cinema.obsidian}
          lightAccentColor={CHAPTER_PALETTES.cinema.lightInk}
          isActive={activeChapter === 'cinema'}
          focusProximity={proximities.cinema}
          maxWidthClass="max-w-4xl"
          sectionRef={(el) => {
            sectionRefs.current.cinema = el;
          }}
        >
          <CinemaSection
            onFocusNode={(nid) => setActiveNodeId(nid)}
            isActiveSection={activeChapter === 'cinema'}
          />
        </StorySection>

        {/* 09. CONTACT & FOOTER */}
        <StorySection
          id="contact"
          indexLabel="09"
          nodeLabel="Cube Impact · Connect"
          title="Contact"
          align="center"
          theme={theme}
          accentColor={CHAPTER_PALETTES.contact.obsidian}
          lightAccentColor={CHAPTER_PALETTES.contact.lightInk}
          isActive={activeChapter === 'contact'}
          focusProximity={proximities.contact}
          maxWidthClass="max-w-3xl"
          sectionRef={(el) => {
            sectionRefs.current.contact = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 divide-y divide-zinc-950/12 border-y border-zinc-950/15 dark:divide-white/10 dark:border-white/12 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3.5 py-4 text-left sm:pr-6">
                <MapPin className="h-5 w-5 shrink-0 text-zinc-950 dark:text-slate-200" />
                <div className="min-w-0">
                  <div className="text-[11px] text-zinc-600 dark:text-slate-400">Location</div>
                  <div className="text-sm font-medium text-zinc-950 dark:text-slate-100">
                    {CONTACT_INFO.location}
                  </div>
                </div>
              </div>

              <a
                href={CONTACT_INFO.phoneHref}
                className="flex items-center gap-3.5 py-4 text-left transition-colors hover:text-zinc-600 dark:hover:text-teal-200 sm:pl-6"
              >
                <Phone className="h-5 w-5 shrink-0 text-zinc-950 dark:text-slate-200" />
                <div className="min-w-0">
                  <div className="text-[11px] text-zinc-600 dark:text-slate-400">Phone</div>
                  <div className="font-mono-tabular text-sm font-medium text-zinc-950 dark:text-slate-100">
                    {CONTACT_INFO.phoneDisplay}
                  </div>
                </div>
              </a>
            </div>

            <div className="grid grid-cols-1 divide-y divide-zinc-950/12 border-b border-zinc-950/15 pb-2 dark:divide-white/10 dark:border-white/12 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-3.5 py-4 text-left transition-colors hover:text-zinc-600 dark:hover:text-teal-200 sm:pr-6"
              >
                <Mail className="h-5 w-5 shrink-0 text-zinc-950 dark:text-slate-200" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-zinc-600 dark:text-slate-400">Email</div>
                  <div className="truncate text-sm font-medium text-zinc-950 dark:text-slate-100">
                    {CONTACT_INFO.email}
                  </div>
                </div>
              </a>

              <a
                href={CONTACT_INFO.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-4 text-left transition-colors hover:text-zinc-600 dark:hover:text-teal-200 sm:pl-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-zinc-950 text-xs font-bold text-white dark:bg-slate-200/20 dark:text-slate-200">
                    in
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-zinc-600 dark:text-slate-400">LinkedIn</div>
                    <div className="truncate text-sm font-medium text-zinc-950 dark:text-slate-100">
                      {CONTACT_INFO.linkedinLabel}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 dark:text-slate-400" />
              </a>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={ASSETS.cvPdf}
                  download="Valerio_Serino_CV_Resume.pdf"
                  className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CV PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-zinc-950/20 bg-white/90 px-4 py-2.5 text-xs font-medium text-zinc-950 transition-colors hover:border-zinc-950 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
                >
                  <span>Quick Card</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => scrollToChapter('home')}
                aria-label="Reassemble cube and return to top"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-medium text-zinc-950 transition-colors hover:text-zinc-600 dark:text-teal-300 dark:hover:text-teal-200"
              >
                <span>Reassemble Cube &amp; Top</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>

            <footer className="pt-4 text-center text-xs text-zinc-600 dark:text-slate-500">
              Built by <strong className="text-zinc-950 dark:text-slate-300">Valerio Serino</strong> · In compliance with{' '}
              <strong className="text-zinc-950 dark:text-slate-300">WCAG 2.2</strong> and Worldwide Accessibility Standards
            </footer>
          </motion.div>
        </StorySection>
      </main>

      {/* Global Command Palette (Cmd/Ctrl+K) */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectPiece={handleSelectPiece}
        onOpenContact={() => setContactOpen(true)}
        onToggleCube={handleToggleCube}
      />

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
