import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CinemaSection } from './components/CinemaSection';
import { CommandPalette } from './components/CommandPalette';
import { ContactModal } from './components/ContactModal';
import { EducationSection } from './components/EducationSection';
import { ObsidianBrainCanvas } from './components/ObsidianBrainCanvas';
import { RightNavRail } from './components/RightNavRail';
import { StorySection, staggerItemVariants } from './components/StorySection';
import { WorkExperienceSection } from './components/WorkExperienceSection';
import {
  ABOUT_CONTENT,
  ASSETS,
  CERTIFICATIONS,
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
  education: 'right',
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
    cinema: 0,
    contact: 0,
  });

  const [cubeManuallyExploded, setCubeManuallyExploded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [typedLength, setTypedLength] = useState(0);

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
      setActiveChapter((prev) => {
        if (prev !== bestId) {
          const chMeta = CHAPTERS.find((c) => c.id === bestId);
          if (chMeta) setActiveNodeId(chMeta.focusNodeId);
        }
        return bestId;
      });
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
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEngine.setEnabled(next);
      if (next) {
        soundEngine.unlock();
        soundEngine.playCubettoClick();
      }
      return next;
    });
  }, []);

  const activeSkillsGroup =
    SKILLS_GROUPS.find((g) => g.id === activeSkillGroupId) || SKILLS_GROUPS[1];
  const activeCertGroup =
    CERTIFICATIONS.find((c) => c.nodeId === activeCertProvider) || CERTIFICATIONS[0];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#04070a] text-slate-100">
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
      />

      {/* Top Reading Progress Bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 h-[2px] bg-white/5"
      >
        <div
          className="h-full origin-left bg-teal-300 transition-transform duration-75"
          style={{
            transform: `scaleX(${scrollProgress})`,
            boxShadow: '0 0 10px rgba(94, 234, 212, 0.9)',
          }}
        />
      </div>

      {/* 3-Zone Top Bar */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#04070a]/90 px-4 py-2.5 sm:px-8 sm:py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => scrollToChapter('home')}
            className="font-display cursor-pointer whitespace-nowrap shrink-0 text-sm font-bold tracking-wider text-slate-50 transition-colors hover:text-teal-300 sm:text-base"
          >
            Valerio Serino
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex"
          >
            <button
              type="button"
              onClick={() => scrollToChapter('about')}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-teal-300 ${
                activeChapter === 'about' ? 'text-teal-300' : ''
              }`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToChapter('experience')}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-teal-300 ${
                activeChapter === 'experience' ? 'text-teal-300' : ''
              }`}
            >
              Experience
            </button>
            <button
              type="button"
              onClick={() => scrollToChapter('publications')}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-teal-300 ${
                activeChapter === 'publications' ? 'text-teal-300' : ''
              }`}
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => scrollToChapter('cinema')}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-teal-300 ${
                activeChapter === 'cinema' ? 'text-teal-300' : ''
              }`}
            >
              Cinema
            </button>
            <button
              type="button"
              onClick={() => scrollToChapter('contact')}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-teal-300 ${
                activeChapter === 'contact' ? 'text-teal-300' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? 'Mute tactile sound' : 'Enable tactile sound'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? 'SFX On' : 'SFX Off'}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-teal-300" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX On' : 'SFX Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-teal-300/35 bg-teal-400/12 px-2.5 py-1.5 text-xs font-medium text-teal-200 transition-colors hover:bg-teal-400/22 sm:px-3.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Navigate Cube</span>
              <span className="font-mono-tabular hidden text-[11px] text-teal-300/80 sm:inline">
                ⌘K
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Right-Edge Chapter Rail */}
      <RightNavRail
        activeChapter={activeChapter}
        onSelectChapter={(id) => scrollToChapter(id)}
      />

      {/* Scroll-Snap Story Container */}
      <main
        ref={scrollContainerRef}
        className="story-scroll-container relative z-10 h-[100dvh] w-full snap-y snap-proximity overflow-y-auto overflow-x-hidden scroll-smooth md:snap-mandatory"
      >
        {/* 00. HOME HERO (Unboxed Editorial Hero + Only the Monolithic Hero Cube on right) */}
        <StorySection
          id="home"
          align="left"
          isActive={activeChapter === 'home'}
          focusProximity={proximities.home}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.home = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-teal-300/40 bg-[#070d12] shadow-[0_0_25px_rgba(94,234,212,0.18)] sm:h-20 sm:w-20 md:h-24 md:w-24">
                <img
                  src={ASSETS.profileImage}
                  alt="Valerio Serino portrait"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wider text-teal-300 sm:text-xs">
                  Interactive 3D Knowledge Cube
                </p>
                <h1 className="font-display mt-1 text-[clamp(1.75rem,4.4vw,3.15rem)] leading-[1.1] font-bold tracking-tight text-balance text-slate-50">
                  Valerio Serino
                </h1>
                <p className="mt-1.5 text-xs text-slate-300 sm:text-sm md:text-base">
                  Senior IT Consultant · AI, Distributed Systems &amp; Security
                </p>
              </div>
            </div>

            {/* Sleek Terminal Prompt */}
            <div className="max-w-lg border-l-2 border-teal-300 bg-[#070d12]/75 px-3.5 py-2.5 font-mono-tabular text-xs text-slate-100 sm:px-4 sm:py-3 sm:text-sm">
              <span className="mr-2 text-teal-300">$</span>
              <span>{TYPED_GREETING.slice(0, typedLength)}</span>
              <span className="terminal-cursor ml-0.5 inline-block text-teal-300">▋</span>
            </div>

            {/* Clean CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={() => scrollToChapter('about')}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-teal-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300 sm:px-5"
              >
                <span>Enter the Cube</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>

              <a
                href={ASSETS.cvPdf}
                download="Valerio_Serino_CV_Resume.pdf"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-100 transition-colors hover:border-teal-300/45 hover:text-teal-200 sm:px-5"
              >
                <Download className="h-3.5 w-3.5 text-teal-300" />
                <span>PDF Resume</span>
              </a>
            </div>

            {/* Hairline KPI Strip (Stacks cleanly on narrow phones, 3-col single-line on sm+) */}
            <div className="grid grid-cols-1 divide-y divide-white/12 border-t border-white/12 pt-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:pt-5">
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
                    style={{ color: metric.accent }}
                  >
                    {metric.value}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-slate-200 sm:mt-1">
                    {metric.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{metric.detail}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </StorySection>

        {/* 01. ABOUT (Unboxed Manifesto Statement) */}
        <StorySection
          id="about"
          indexLabel="01"
          nodeLabel="Cube Impact · Mindset"
          title="About"
          align="left"
          accentColor="#2dd4bf"
          isActive={activeChapter === 'about'}
          focusProximity={proximities.about}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.about = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <blockquote className="font-display text-[clamp(1.25rem,2.6vw,1.9rem)] font-semibold leading-snug text-teal-300">
              &ldquo;{ABOUT_CONTENT.quote}&rdquo;
            </blockquote>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
              {ABOUT_CONTENT.bio.replace(/ and one principle:$/, '.')}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-white/12 pt-4 text-xs font-medium tracking-wide text-slate-400">
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

        {/* 02. SKILLS (Right-aligned Interactive Matrix · 3D Cube flies to LEFT!) */}
        <StorySection
          id="skills"
          indexLabel="02"
          nodeLabel="Cube Impact · Capabilities"
          title="Skills"
          align="right"
          accentColor="#38bdf8"
          isActive={activeChapter === 'skills'}
          focusProximity={proximities.skills}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.skills = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            {/* Interactive Segmented Switcher rotating 3D Cube to exact Skills cubetto */}
            <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto border-b border-white/12 pb-3 sm:flex-wrap sm:gap-2">
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
                        ? 'text-slate-950'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="skills-active-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-teal-300"
                      />
                    )}
                    <span className="relative z-10">{group.title}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkillsGroup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-3"
              >
                {activeSkillsGroup.items.map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.28 }}
                    className="border-b border-white/10 pb-2 text-xs font-medium text-slate-100 sm:text-sm"
                  >
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </StorySection>

        {/* 03. WORK EXPERIENCE (Left-aligned Kinetic Timeline · Cube on RIGHT) */}
        <StorySection
          id="experience"
          indexLabel="03"
          nodeLabel="Cube Impact · Career Trajectory"
          title="Work Experience"
          align="left"
          accentColor="#5eead4"
          isActive={activeChapter === 'experience'}
          focusProximity={proximities.experience}
          maxWidthClass="max-w-2xl"
          sectionRef={(el) => {
            sectionRefs.current.experience = el;
          }}
        >
          <WorkExperienceSection onFocusNode={(nid) => setActiveNodeId(nid)} />
        </StorySection>

        {/* 04. CERTIFICATIONS (Right-aligned Architectural Ledger · Cube on LEFT) */}
        <StorySection
          id="certifications"
          indexLabel="04"
          nodeLabel="Cube Impact · Verified Credentials"
          title="Certifications"
          align="right"
          accentColor="#a78bfa"
          isActive={activeChapter === 'certifications'}
          focusProximity={proximities.certifications}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.certifications = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5">
            <div className="no-scrollbar flex flex-nowrap gap-5 overflow-x-auto border-b border-white/12 pb-3 sm:gap-6">
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
                      isSelected ? 'text-teal-300' : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <span>{group.provider}</span>
                    <span className="font-mono-tabular ml-2 text-xs text-slate-500">
                      ({group.items.length})
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="cert-provider-line"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute -bottom-3 left-0 right-0 h-[2px] bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.85)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.ul
                key={activeCertGroup.nodeId}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="divide-y divide-white/10"
              >
                {activeCertGroup.items.map((cert, idx) => (
                  <motion.li
                    key={cert}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center justify-between gap-3 py-2.5 text-xs text-slate-100 sm:py-3 sm:text-sm"
                  >
                    <span>{cert}</span>
                    <span className="font-mono-tabular shrink-0 text-xs text-slate-500">
                      0{idx + 1}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </motion.div>
        </StorySection>

        {/* 05. PUBLICATIONS (Left-aligned IEEE Spotlight Monograph · Cube on RIGHT) */}
        <StorySection
          id="publications"
          indexLabel="05"
          nodeLabel="Cube Impact · Peer-Reviewed Research"
          title="Publications"
          align="left"
          accentColor="#f59e0b"
          isActive={activeChapter === 'publications'}
          focusProximity={proximities.publications}
          maxWidthClass="max-w-xl"
          sectionRef={(el) => {
            sectionRefs.current.publications = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-4 sm:space-y-5">
            <div className="font-display text-xs font-semibold tracking-widest text-amber-300">
              IEEE XPLORE · ICETCI 2021
            </div>
            <h3 className="text-[clamp(1.125rem,2.1vw,1.5rem)] font-semibold leading-snug text-slate-50">
              {PUBLICATION.title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
              {PUBLICATION.venue}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={PUBLICATION.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-[#005f56] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#00796d]"
              >
                <span>View Publication</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span className="text-xs text-slate-400">
                Earth Observation · Multi-Agent Systems · Phenological Context
              </span>
            </div>
          </motion.div>
        </StorySection>

        {/* 06. EDUCATION (Left-aligned Monograph with Interactive Sub-Cube Projects) */}
        <StorySection
          id="education"
          indexLabel="06"
          nodeLabel="Cube Impact · Academic Foundations"
          title="Education"
          align="left"
          accentColor="#34d399"
          isActive={activeChapter === 'education'}
          focusProximity={proximities.education}
          maxWidthClass="max-w-2xl"
          sectionRef={(el) => {
            sectionRefs.current.education = el;
          }}
        >
          <EducationSection onFocusNode={(nid) => setActiveNodeId(nid)} />
        </StorySection>

        {/* 07. CONTEST AZIENDALI / REPLY FILM FESTIVAL (Centered Widescreen Theater) */}
        <StorySection
          id="cinema"
          indexLabel="07"
          nodeLabel="Cube Impact · Contest Aziendali"
          title="Reply Film Festival"
          subtitle="Experimental AI short films produced for the Reply AI Film Contest (ComfyUI, Hugging Face & Google Veo 2)."
          align="center"
          accentColor="#f472b6"
          isActive={activeChapter === 'cinema'}
          focusProximity={proximities.cinema}
          maxWidthClass="max-w-4xl"
          sectionRef={(el) => {
            sectionRefs.current.cinema = el;
          }}
        >
          <CinemaSection onFocusNode={(nid) => setActiveNodeId(nid)} />
        </StorySection>

        {/* 08. CONTACT & FOOTER (Centered Architectural Closing Dock) */}
        <StorySection
          id="contact"
          indexLabel="08"
          nodeLabel="Cube Impact · Connect"
          title="Contact"
          align="center"
          accentColor="#94a3b8"
          isActive={activeChapter === 'contact'}
          focusProximity={proximities.contact}
          maxWidthClass="max-w-3xl"
          sectionRef={(el) => {
            sectionRefs.current.contact = el;
          }}
        >
          <motion.div variants={staggerItemVariants} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 divide-y divide-white/10 border-y border-white/12 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3.5 py-4 text-left sm:pr-6">
                <MapPin className="h-5 w-5 shrink-0 text-teal-300" />
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400">Location</div>
                  <div className="text-sm font-medium text-slate-100">
                    {CONTACT_INFO.location}
                  </div>
                </div>
              </div>

              <a
                href={CONTACT_INFO.phoneHref}
                className="flex items-center gap-3.5 py-4 text-left transition-colors hover:text-teal-200 sm:pl-6"
              >
                <Phone className="h-5 w-5 shrink-0 text-teal-300" />
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400">Phone</div>
                  <div className="font-mono-tabular text-sm font-medium text-slate-100">
                    {CONTACT_INFO.phoneDisplay}
                  </div>
                </div>
              </a>
            </div>

            <div className="grid grid-cols-1 divide-y divide-white/10 border-b border-white/12 pb-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-3.5 py-4 text-left transition-colors hover:text-teal-200 sm:pr-6"
              >
                <Mail className="h-5 w-5 shrink-0 text-teal-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400">Email</div>
                  <div className="truncate text-sm font-medium text-slate-100">
                    {CONTACT_INFO.email}
                  </div>
                </div>
              </a>

              <a
                href={CONTACT_INFO.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-4 text-left transition-colors hover:text-teal-200 sm:pl-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-teal-300/20 text-xs font-bold text-teal-300">
                    in
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-400">LinkedIn</div>
                    <div className="truncate text-sm font-medium text-slate-100">
                      {CONTACT_INFO.linkedinLabel}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={ASSETS.cvPdf}
                  download="Valerio_Serino_CV_Resume.pdf"
                  className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-teal-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CV PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
                >
                  <span>Quick Card</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => scrollToChapter('home')}
                aria-label="Reassemble cube and return to top"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-medium text-teal-300 transition-colors hover:text-teal-200"
              >
                <span>Reassemble Cube &amp; Top</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>

            <footer className="pt-4 text-center text-xs text-slate-500">
              Built by <strong className="text-slate-300">Valerio Serino</strong> · In compliance with{' '}
              <strong className="text-slate-300">WCAG 2.2</strong> and Worldwide Accessibility Standards
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
