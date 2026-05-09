import { useCallback, useEffect, useRef, useState } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // px to pull before triggering refresh
  disabled?: boolean;
}

interface UsePullToRefreshResult {
  isRefreshing: boolean;
  pullDistance: number; // 0-1 progress ratio (capped at 1)
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Pull-to-refresh hook for touch devices.
 * Attach `containerRef` to the scrollable container element.
 * Shows a spinner when `isRefreshing` is true and a progress indicator via `pullDistance`.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startYRef = useRef<number | null>(null);
  const currentDistanceRef = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      const el = containerRef.current;
      // Only trigger when scrolled to the very top
      if (el && el.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startYRef.current === null || disabled || isRefreshing) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) {
        startYRef.current = null;
        setPullDistance(0);
        return;
      }
      // Dampen the pull with a rubber-band feel
      const dampened = Math.min(delta * 0.5, threshold * 1.5);
      currentDistanceRef.current = dampened;
      setPullDistance(dampened / threshold);
      // Prevent page scroll while pulling
      if (delta > 8) e.preventDefault();
    },
    [disabled, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    if (currentDistanceRef.current >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
    currentDistanceRef.current = 0;
  }, [isRefreshing, onRefresh, threshold]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance, containerRef };
}
