import { useRef, type TouchEvent } from 'react';

interface UseHorizontalSwipeOptions {
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
  thresholdPx?: number;
}

export function useHorizontalSwipe({
  onNext,
  onPrev,
  enabled = true,
  thresholdPx = 44,
}: UseHorizontalSwipeOptions) {
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (!enabled || e.touches.length !== 1) {
      startRef.current = null;
      return;
    }

    const target = e.target as HTMLElement | null;
    const horizontalScroller = target?.closest('.overflow-x-auto') as HTMLElement | null;
    if (
      horizontalScroller &&
      horizontalScroller.scrollWidth > horizontalScroller.clientWidth + 4
    ) {
      startRef.current = null;
      return;
    }

    const touch = e.touches[0];
    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    const start = startRef.current;
    startRef.current = null;
    if (!enabled || !start || e.changedTouches.length !== 1) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;

    if (dt > 750) return;
    if (Math.abs(dx) < thresholdPx) return;
    if (Math.abs(dx) <= Math.abs(dy) * 1.35) return;

    if (dx < 0) {
      onNext();
    } else {
      onPrev();
    }
  };

  const onTouchCancel = () => {
    startRef.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
  };
}
