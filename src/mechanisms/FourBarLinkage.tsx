import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 04 — Four-Bar Linkage (Grashof crank-rocker).
 * Continuous rotary input → oscillating output. The crank turns a full circle;
 * the coupler rocks the follower through a limited arc.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   ground pivots O2 = (110, 228), O4 = (230, 228)
 *   crank b = 45, coupler c = 150, rocker d = 100
 *   Grashof: shortest (45) + longest (150) ≤ 100 + 120 (ground) → crank-rocker.
 *
 * A = O2 + b·(cosθ, sinθ); B is the circle–circle intersection of
 * |B−A| = c and |B−O4| = d, solved closed-form each frame (elbow-up branch).
 */
const O2 = { x: 110, y: 228 };
const O4 = { x: 230, y: 228 };
const B_CRANK = 45;
const C_COUPLER = 150;
const D_ROCKER = 100;
const TWO_PI = Math.PI * 2;
const DURATION = 3400;

function solveB(A: { x: number; y: number }) {
  const dx = O4.x - A.x;
  const dy = O4.y - A.y;
  const d0 = Math.hypot(dx, dy);
  const a = (C_COUPLER * C_COUPLER - D_ROCKER * D_ROCKER + d0 * d0) / (2 * d0);
  const h = Math.sqrt(Math.max(0, C_COUPLER * C_COUPLER - a * a));
  const ux = dx / d0;
  const uy = dy / d0;
  // elbow-up branch: perpendicular (uy, -ux)
  return {
    x: A.x + a * ux + h * uy,
    y: A.y + a * uy - h * ux,
  };
}

const FourBarLinkage = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const crankRef = useRef<SVGLineElement>(null);
    const couplerRef = useRef<SVGLineElement>(null);
    const rockerRef = useRef<SVGLineElement>(null);
    const pinARef = useRef<SVGCircleElement>(null);
    const pinBRef = useRef<SVGCircleElement>(null);
    const animRef = useRef<Driver | null>(null);
    useMechanismHandle(ref, animRef);

    useEffect(() => {
      const state = { t: 0 };
      let frame = 0;

      const anim = animate(state, {
        t: [0, TWO_PI],
        duration: DURATION,
        ease: 'linear',
        loop: true,
        onUpdate: () => {
          const th = state.t;
          const A = { x: O2.x + B_CRANK * Math.cos(th), y: O2.y + B_CRANK * Math.sin(th) };
          const B = solveB(A);

          crankRef.current?.setAttribute('x1', String(O2.x));
          crankRef.current?.setAttribute('y1', String(O2.y));
          crankRef.current?.setAttribute('x2', String(A.x));
          crankRef.current?.setAttribute('y2', String(A.y));

          couplerRef.current?.setAttribute('x1', String(A.x));
          couplerRef.current?.setAttribute('y1', String(A.y));
          couplerRef.current?.setAttribute('x2', String(B.x));
          couplerRef.current?.setAttribute('y2', String(B.y));

          rockerRef.current?.setAttribute('x1', String(O4.x));
          rockerRef.current?.setAttribute('y1', String(O4.y));
          rockerRef.current?.setAttribute('x2', String(B.x));
          rockerRef.current?.setAttribute('y2', String(B.y));

          pinARef.current?.setAttribute('cx', String(A.x));
          pinARef.current?.setAttribute('cy', String(A.y));
          pinBRef.current?.setAttribute('cx', String(B.x));
          pinBRef.current?.setAttribute('cy', String(B.y));

          if (frame++ % 6 === 0) {
            const rocker = deg(Math.atan2(B.y - O4.y, B.x - O4.x));
            onReadout?.(`θ ${fmt(deg(th), 0)}° · rocker ${fmt(rocker, 0)}°`);
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
          <line x1="70" y1="330" x2="330" y2="330" strokeWidth="3" />
          <line x1={O2.x} y1={O2.y} x2={O2.x} y2="330" />
          <line x1={O4.x} y1={O4.y} x2={O4.x} y2="330" />
          <circle cx={O2.x} cy={O2.y} r="4" />
          <circle cx={O4.x} cy={O4.y} r="4" />
        </g>

        {/* ---- crank (O2 → A) ---- */}
        <line ref={crankRef} className="moving glow-line" strokeWidth="7" strokeLinecap="round" />

        {/* ---- coupler (A → B) ---- */}
        <line ref={couplerRef} className="moving" strokeWidth="6" strokeLinecap="round" />

        {/* ---- rocker (O4 → B) ---- */}
        <line ref={rockerRef} className="moving glow-line" strokeWidth="7" strokeLinecap="round" />

        {/* ---- moving pins ---- */}
        <circle ref={pinARef} className="pin" r="6.5" />
        <circle ref={pinBRef} className="pin" r="6.5" />

        {/* ---- labels ---- */}
        <g className="label">
          <text x={O2.x} y="372" textAnchor="middle">CRANK</text>
          <text x={O4.x} y="372" textAnchor="middle">ROCKER</text>
        </g>
      </Schematic>
    );
  },
);

FourBarLinkage.displayName = 'FourBarLinkage';
export default FourBarLinkage;
