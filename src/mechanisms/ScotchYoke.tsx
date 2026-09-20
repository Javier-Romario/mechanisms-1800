import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 06 — Scotch Yoke.
 * Continuous rotary input → sinusoidal linear output. A crank pin slides
 * inside a straight slot cut in the yoke, pushing it up and down with pure
 * simple-harmonic motion — no connecting rod, no side thrust. The classic
 * drive for pumps and small compressors.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   crank centre O = (160, 210), radius r = 45
 *   yoke translates vertically only; yoke y = O.y + r·sinθ
 */
const OX = 160;
const OY = 210;
const R = 45;
const TWO_PI = Math.PI * 2;
const DURATION = 3400;

// yoke silhouette: 120×120 frame with a horizontal slot cut via even-odd
const rect = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
const YOKE_PATH = [rect(-60, -60, 120, 120), rect(-50, -7, 100, 14)].join(' ');

const ScotchYoke = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const wheelRef = useRef<SVGGElement>(null);
    const yokeRef = useRef<SVGGElement>(null);
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
          const yokeY = OY + R * Math.sin(th);

          wheelRef.current?.setAttribute(
            'transform',
            `rotate(${deg(th)} ${OX} ${OY})`,
          );
          yokeRef.current?.setAttribute(
            'transform',
            `translate(${OX} ${yokeY})`,
          );

          if (frame++ % 6 === 0) {
            onReadout?.(`θ ${fmt(deg(th), 0)}° · yoke ${fmt(yokeY, 1)}`);
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
          {/* base */}
          <line x1="110" y1="340" x2="300" y2="340" strokeWidth="3" />
          {/* crank pedestal */}
          <line x1={OX} y1={OY} x2={OX} y2="340" />
          {/* yoke guide rails */}
          <line x1="88" y1="90" x2="88" y2="330" />
          <line x1="232" y1="90" x2="232" y2="330" />
          {/* guide top bracket */}
          <line x1="88" y1="90" x2="232" y2="90" />
        </g>

        {/* ---- crank wheel (rotating) ---- */}
        <g ref={wheelRef}>
          <circle className="solid" cx={OX} cy={OY} r={R} />
          {/* crank arm to pin */}
          <line
            className="moving"
            x1={OX}
            y1={OY}
            x2={OX + R}
            y2={OY}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle className="pin-glow" cx={OX + R} cy={OY} r="9" />
          <circle className="pin" cx={OX + R} cy={OY} r="6.5" />
          <circle className="pin" cx={OX} cy={OY} r="3.5" />
        </g>

        {/* ---- yoke (sliding vertically) ---- */}
        <g ref={yokeRef}>
          <path d={YOKE_PATH} fillRule="evenodd" className="solid glow-fill" />
        </g>

        {/* ---- labels ---- */}
        <g className="label">
          <text x={OX} y="372" textAnchor="middle">CRANK</text>
          <text x={OX} y="44" textAnchor="middle">YOKE</text>
        </g>
      </Schematic>
    );
  },
);

ScotchYoke.displayName = 'ScotchYoke';
export default ScotchYoke;
