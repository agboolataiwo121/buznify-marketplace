import { RefreshCw } from "lucide-react";

interface Props {
  isRefreshing: boolean;
  pullDistance: number; // 0-1 ratio
}

/**
 * Visual indicator shown at the top of a pull-to-refresh container.
 * `pullDistance` drives the opacity and rotation during the pull gesture.
 * When `isRefreshing` is true the spinner animates continuously.
 */
export default function PullToRefreshIndicator({ isRefreshing, pullDistance }: Props) {
  const visible = isRefreshing || pullDistance > 0.05;
  if (!visible) return null;

  const progress = Math.min(pullDistance, 1);
  const rotation = isRefreshing ? undefined : `rotate(${progress * 360}deg)`;
  const opacity = isRefreshing ? 1 : Math.min(progress * 1.5, 1);
  const translateY = isRefreshing ? 0 : `${(progress - 1) * 20}px`;

  return (
    <div
      className="flex items-center justify-center py-3 transition-all duration-150"
      style={{ opacity, transform: `translateY(${translateY})` }}
    >
      <div
        className={`w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center ${
          isRefreshing ? "animate-spin" : ""
        }`}
        style={{ transform: rotation }}
      >
        <RefreshCw className="w-4 h-4 text-primary" />
      </div>
      {isRefreshing && (
        <span className="ml-2 text-xs text-muted-foreground">Refreshing…</span>
      )}
    </div>
  );
}
