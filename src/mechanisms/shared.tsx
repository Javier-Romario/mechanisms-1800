import {
  useId,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import type { MechanismHandle } from './types';

const deg = (rad: number) => (rad * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** Polar → cartesian helper. */
export function polar(cx: number, cy: number, r: number, aRad: number) {
  return { x: cx + r * Math.cos(aRad), y: cy + r * Math.sin(aRad) };
}

/** Clamp + format helpers used by the live readouts. */
export const fmt = (n: number, d = 1) => n.toFixed(d);

export { deg, rad };

/**
 * Minimal shape of the animejs animation object we drive (pauses, speed,
 * seeks). Keeps the mechanism components decoupled from animejs internals.
 */
export interface Driver {
  paused: boolean;
  speed: number;
  pause(): void;
  play(): void;
  seek(t: number): void;
}

/**
 * Builds a stable `MechanismHandle` whose methods read the animation lazily,
 * so the animation can be created in `useEffect` without recreating the handle.
 */
export function useMechanismHandle(
  ref: Ref<MechanismHandle>,
  animRef: MutableRefObject<Driver | null>,
) {
  const handle = useRef<MechanismHandle>({
    toggle() {
      const a = animRef.current;
      if (!a) return;
      if (a.paused) a.play();
      else a.pause();
    },
    setSpeed(mult: number) {
      if (animRef.current) animRef.current.speed = mult;
    },
    restart() {
      const a = animRef.current;
      if (!a) return;
      a.seek(0);
      a.play();
    },
    speed: () => animRef.current?.speed ?? 1,
    running: () => (animRef.current ? !animRef.current.paused : true),
  });
  useImperativeHandle(ref, () => handle.current, []);
}

/**
 * Blueprint-style SVG canvas: dot grid + border, theme-aware via CSS vars.
 * Every mechanism renders its geometry inside this shell so the "schematic"
 * look stays consistent.
 *
 * RULE — square canvas, safe inset:
 *   - viewBox is always `0 0 400 400` (square).
 *   - every piece of geometry (static + animated, at any frame) stays inside
 *     the safe zone [24, 376] on both axes. NEONDECK cards chamfer their
 *     corners, so we keep a 24px gutter and never draw into it.
 *   - labels render *inside* the viewBox.
 */
export function Schematic({
  viewBox = '0 0 400 400',
  children,
}: {
  viewBox?: string;
  children: ReactNode;
}) {
  const gridId = useId();
  return (
    <svg
      className="mech-svg"
      viewBox={viewBox}
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id={gridId}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="var(--mech-grid)" />
          <circle cx="11.5" cy="11.5" r="1" fill="var(--mech-grid-strong)" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="400" height="400" fill={`url(#${gridId})`} />
      {children}
    </svg>
  );
}
