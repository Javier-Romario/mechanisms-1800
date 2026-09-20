import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, polar, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 03 — Ratchet & Pawl.
 * Oscillating lever input → one-way, intermittent rotary output. The driving
 * pawl advances the wheel one tooth on the forward stroke and slips over the
 * teeth on the return; the holding pawl clicks down each step and blocks
 * reverse motion.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   wheel centre C = (200, 210), tooth tip radius 90, root radius 72, 12 teeth
 *   driving lever pivots at C, swings ±30° (one tooth pitch)
 *   holding pawl pivots at (200, 75), rests in the top tooth root
 */
const N = 12;
const PITCH = (2 * Math.PI) / N; // 30°
const RO = 90;
const RR = 72;
const CX = 200;
const CY = 210;
const TWO_PI = Math.PI * 2;
const DURATION = N * 950; // one full wheel turn per loop

function ratchetPath(n: number, ro: number, rr: number): string {
  const pitch = (2 * Math.PI) / n;
  const start = polar(0, 0, rr, 0);
  let d = `M ${fmt(start.x, 2)} ${fmt(start.y, 2)}`;
  for (let k = 0; k < n; k++) {
    const tip = polar(0, 0, ro, k * pitch);
    const root = polar(0, 0, rr, (k + 1) * pitch);
    d += ` L ${fmt(tip.x, 2)} ${fmt(tip.y, 2)} L ${fmt(root.x, 2)} ${fmt(root.y, 2)}`;
  }
  return d + ' Z';
}

const WHEEL_PATH = ratchetPath(N, RO, RR);

const RatchetPawl = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const wheelRef = useRef<SVGGElement>(null);
    const leverRef = useRef<SVGGElement>(null);
    const pawlRef = useRef<SVGGElement>(null);
    const holdRef = useRef<SVGGElement>(null);
    const animRef = useRef<Driver | null>(null);
    useMechanismHandle(ref, animRef);

    useEffect(() => {
      const state = { t: 0 };
      let frame = 0;

      const anim = animate(state, {
        t: [0, N * TWO_PI],
        duration: DURATION,
        ease: 'linear',
        loop: true,
        onUpdate: () => {
          const T = state.t;
          const i = Math.floor(T / TWO_PI);
          const u = (T - i * TWO_PI) / TWO_PI; // [0, 1)
          const forward = u < 0.5;

          // driving lever: triangular oscillation through one tooth pitch
          const psi = forward ? PITCH * (2 * u) : PITCH * (2 - 2 * u);

          // wheel: staircase — follows the lever on the forward stroke, holds
          // on the return stroke
          const wheel = i * PITCH + (forward ? psi : PITCH);

          // pawl lifts (slips) over the teeth on the return stroke
          const slip = forward ? 0 : -(PITCH * 0.95) * ((u - 0.5) / 0.5);

          // holding pawl kicks up as each tooth passes, then drops (the click)
          const lift = forward ? 40 * Math.sin(Math.PI * (u / 0.5)) : 0;

          wheelRef.current?.setAttribute(
            'transform',
            `translate(${CX} ${CY}) rotate(${deg(wheel)})`,
          );
          leverRef.current?.setAttribute(
            'transform',
            `translate(${CX} ${CY}) rotate(${deg(psi)})`,
          );
          pawlRef.current?.setAttribute(
            'transform',
            `translate(72 0) rotate(${deg(slip)})`,
          );
          holdRef.current?.setAttribute(
            'transform',
            `translate(200 75) rotate(${deg(lift)})`,
          );

          if (frame++ % 7 === 0) {
            onReadout?.(
              `tooth ${(i % N) + 1}/${N} · lever ${fmt(deg(psi), 0)}° · wheel ${fmt((deg(wheel) % 360 + 360) % 360, 0)}°`,
            );
          }
        },
      });

      animRef.current = anim as unknown as Driver;
      return () => {
        anim.pause();
        animRef.current = null;
      };
    }, [onReadout]);

    return (
      <Schematic>
        {/* ---- fixed frame ---- */}
        <g className="static">
          {/* wheel pedestal */}
          <line x1={CX} y1={CY} x2={CX} y2="340" />
          {/* wheel base line */}
          <line x1="90" y1="340" x2="330" y2="340" strokeWidth="3" />
          {/* holding pawl bracket */}
          <line x1="200" y1="75" x2="200" y2="62" />
          <line x1="186" y1="62" x2="214" y2="62" />
        </g>

        {/* ---- ratchet wheel (stepping) ---- */}
        <g ref={wheelRef}>
          <path d={WHEEL_PATH} className="solid" />
          <circle className="moving" r={RO + 2} fill="none" />
          <circle className="moving" r={RR - 8} fill="none" strokeWidth="1" />
          <circle className="pin" r="4" />
        </g>

        {/* ---- driving lever + pawl (oscillating) ---- */}
        <g ref={leverRef}>
          <line className="moving" x1="0" y1="0" x2="72" y2="0" strokeWidth="5" strokeLinecap="round" />
          <g ref={pawlRef}>
            <line className="moving" x1="0" y1="0" x2="13" y2="0" strokeWidth="6" strokeLinecap="round" />
            {/* hook */}
            <line className="moving" x1="13" y1="0" x2="6" y2="-8" strokeWidth="4" strokeLinecap="round" />
          </g>
          <circle className="pin" cx="0" cy="0" r="4.5" />
        </g>

        {/* ---- holding pawl (clicking) ---- */}
        <g ref={holdRef}>
          <line className="moving" x1="0" y1="0" x2="0" y2="63" strokeWidth="5" strokeLinecap="round" />
          <line className="moving" x1="0" y1="63" x2="-11" y2="63" strokeWidth="5" strokeLinecap="round" />
          <circle className="pin" cx="0" cy="0" r="4" />
        </g>

        {/* ---- labels ---- */}
        <g className="label">
          <text x={CX} y="372" textAnchor="middle">RATCHET WHEEL</text>
          <text x="200" y="56" textAnchor="middle">HOLDING PAWL</text>
        </g>
      </Schematic>
    );
  },
);

RatchetPawl.displayName = 'RatchetPawl';
export default RatchetPawl;
