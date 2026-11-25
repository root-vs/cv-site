import { ReactNode, useEffect, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ChapterId } from '../data/cvVault';
import type { CubeThemeMode } from './ObsidianBrainCanvas';

interface StorySectionProps {
  id: ChapterId;
  indexLabel?: string;
  title?: string;
  subtitle?: string;
  nodeLabel?: string;
  accentColor?: string;
  lightAccentColor?: string;
  theme?: CubeThemeMode;
  isActive: boolean;
  focusProximity: number; // 1 = center of viewport, 0 = far
  align?: 'center' | 'left' | 'right';
  maxWidthClass?: string;
  children: ReactNode;
  sectionRef?: (el: HTMLElement | null) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [94, 234, 212];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.03,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_OUT_EXPO,
    },
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: '0' | '1' | '·';
  size: number;
  alpha: number;
}

export function StorySection({
  id,
  indexLabel,
  title,
  subtitle,
  nodeLabel,
  accentColor = '#5eead4',
  lightAccentColor = '#09090b',
  theme = 'obsidian',
  isActive,
  focusProximity,
  align = 'center',
  maxWidthClass = 'max-w-4xl',
  children,
  sectionRef,
}: StorySectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const proximityRef = useRef(focusProximity);
  const activeRef = useRef(isActive);
  const themeRef = useRef(theme);
  const accentRgbRef = useRef<[number, number, number]>(hexToRgbTuple(accentColor));
  const prefersReducedMotion = useReducedMotion();

  proximityRef.current = focusProximity;
  activeRef.current = isActive;
  themeRef.current = theme;
  accentRgbRef.current = hexToRgbTuple(accentColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_PARTICLES = 36;
    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: -(0.00016 + Math.random() * 0.00035),
      char: i % 4 === 0 ? '·' : i % 2 === 0 ? '1' : '0',
      size: i % 4 === 0 ? 14 : 11 + (i % 2),
      alpha: 0.12 + Math.random() * 0.24,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(parent.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(parent.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const prox = proximityRef.current;
      const active = activeRef.current;
      const isLight = themeRef.current === 'light';
      const [r, g, b] = accentRgbRef.current;

      const visibleCount = Math.round(10 + prox * (MAX_PARTICLES - 10));
      const speedMult = (active ? 1.85 : 0.7) * (0.45 + prox * 1.15);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < visibleCount; i++) {
        const p = particles[i];
        p.x += p.vx * dt * speedMult;
        p.y += p.vy * dt * speedMult;

        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const opacity = p.alpha * (0.2 + prox * 0.8) * (isLight ? 0.55 : 1.0);
        ctx.fillStyle = isLight
          ? `rgba(24, 24, 27, ${opacity.toFixed(3)})`
          : `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(3)})`;
        ctx.font = `500 ${p.size}px "JetBrains Mono", monospace`;
        ctx.fillText(p.char, p.x * w, p.y * h);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReducedMotion]);

  const clampedProx = Math.max(0, Math.min(1, focusProximity));
  const sectionOpacity = prefersReducedMotion ? 1 : 0.16 + clampedProx * 0.84;
  const sectionScale = prefersReducedMotion ? 1 : 0.92 + clampedProx * 0.08;
  const effectiveAccent = theme === 'light' ? lightAccentColor : accentColor;

  const alignClasses =
    align === 'left'
      ? 'justify-center lg:justify-start'
      : align === 'right'
      ? 'justify-center lg:justify-end'
      : 'justify-center';

  // Directional readability gradient behind content on desktop, balanced full scrim on mobile/tablet
  const directionalScrim =
    align === 'left'
      ? 'bg-[#f4f4f5]/88 dark:bg-[#04070a]/80 lg:bg-transparent lg:dark:bg-transparent lg:bg-gradient-to-r lg:from-[#f4f4f5]/95 lg:via-[#f4f4f5]/78 lg:to-transparent lg:dark:from-[#04070a]/96 lg:dark:via-[#04070a]/75 lg:dark:to-transparent'
      : align === 'right'
      ? 'bg-[#f4f4f5]/88 dark:bg-[#04070a]/80 lg:bg-transparent lg:dark:bg-transparent lg:bg-gradient-to-l lg:from-[#f4f4f5]/95 lg:via-[#f4f4f5]/78 lg:to-transparent lg:dark:from-[#04070a]/96 lg:dark:via-[#04070a]/75 lg:dark:to-transparent'
      : 'bg-radial from-[#f4f4f5]/94 via-[#f4f4f5]/78 to-[#f4f4f5]/42 dark:from-[#04070a]/90 dark:via-[#04070a]/70 dark:to-[#04070a]/30';

  return (
    <section
      id={id}
      ref={sectionRef}
      data-chapter={id}
      className="pointer-events-none relative flex min-h-[100dvh] w-full snap-start md:snap-center items-center px-4 pt-[74px] pb-10 sm:px-8 sm:pt-24 sm:pb-16 lg:px-14 lg:pr-32"
    >
      {/* Subtle directional gradient scrim for crisp typography legibility over 3D space */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${directionalScrim}`}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className={`relative z-10 mx-auto flex w-full max-w-6xl ${alignClasses}`}
        style={{
          opacity: sectionOpacity,
          transform: `scale(${sectionScale.toFixed(4)})`,
          transition:
            'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <motion.div
          className={`pointer-events-auto w-full ${maxWidthClass}`}
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.12 }}
        >
          {(title || nodeLabel) && (
            <motion.div variants={staggerItemVariants} className="mb-5 sm:mb-6">
              {nodeLabel && (
                <div className="mb-2 flex items-center gap-2.5 text-xs font-medium tracking-wider text-zinc-600 dark:text-slate-400">
                  {indexLabel && (
                    <span
                      className="font-mono-tabular font-semibold"
                      style={{ color: effectiveAccent }}
                    >
                      {indexLabel}.
                    </span>
                  )}
                  <span>{nodeLabel}</span>
                </div>
              )}

              {title && (
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full transition-shadow duration-300"
                    style={{
                      backgroundColor: effectiveAccent,
                      boxShadow:
                        theme === 'light'
                          ? `0 0 0 3px ${effectiveAccent}24`
                          : `0 0 14px ${accentColor}, 0 0 28px ${accentColor}99`,
                    }}
                  />
                  <h2 className="font-display text-[clamp(1.625rem,3.2vw,2.5rem)] leading-[1.15] font-bold tracking-tight text-balance text-zinc-950 dark:text-slate-50">
                    {title}
                  </h2>
                </div>
              )}

              {subtitle && (
                <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-slate-300 sm:text-base">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          {children}
        </motion.div>
      </div>
    </section>
  );
}
