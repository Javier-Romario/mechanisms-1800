import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 01 — Crank & Connecting Rod (slider-crank).
 * Continuous rotary input → reciprocating linear output. This is the
 * heartbeat linkage of every piston engine.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   crank center C = (146, 260), radius R = 55
 *   slider axis y = 140 (guide rail), connecting rod length L = 185
 *
 * Slider x is solved exactly from |rod| = L with the wrist pin locked to y = 140:
 *   x = Cx + R·cosθ + sqrt(L² − (R·sinθ − (140 − Cy))²)
 */
const CX = 146;
const CY = 260;
const R = 55;
const L = 185;
const SLIDER_Y = 140;
const DY = SLIDER_Y - CY; // -120
const TWO_PI = Math.PI * 2;
const DURATION = 3200; // one full crank rev

const CrankSlider = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const wheelRef = useRef<SVGGElement>(null);
    const rodRef = useRef<SVGLineElement>(null);
    const sliderRef = useRef<SVGGElement>(null);
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
          const sin = Math.sin(th);
          const cos = Math.cos(th);

          // crank pin (world)
          const px = CX + R * cos;
          const py = CY + R * sin;

          // slider x — exact slider-crank closure
          const root = Math.sqrt(L * L - (R * sin - DY) * (R * sin - DY));
          const sx = CX + R * cos + root;

          wheelRef.current?.setAttribute(
            'transform',
            `rotate(${deg(th)} ${CX} ${CY})`,
          );
          rodRef.current?.setAttribute('x1', String(px));
          rodRef.current?.setAttribute('y1', String(py));
          rodRef.current?.setAttribute('x2', String(sx));
          rodRef.current?.setAttribute('y2', String(SLIDER_Y));
          sliderRef.current?.setAttribute(
            'transform',
            `translate(${sx} ${SLIDER_Y})`,
          );

          if (frame++ % 6 === 0) {
            onReadout?.(
              `θ ${fmt(deg(th), 0)}° · piston x ${fmt(sx, 1)} · stroke ${fmt(2 * R, 0)}`,
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
        {/* ---- static frame ---- */}
        <g className="static">
          {/* base */}
          <line x1="126" y1="350" x2="376" y2="350" strokeWidth="3" />
          {/* crank pedestal */}
          <line x1={CX} y1={CY} x2={CX} y2="350" />
          {/* guide rail */}
          <line x1="178" y1={SLIDER_Y} x2="376" y2={SLIDER_Y} strokeWidth="2.5" />
          {/* guide supports */}
          <line x1="182" y1={SLIDER_Y} x2="182" y2="350" />
          <line x1="376" y1={SLIDER_Y} x2="376" y2="350" />
          {/* guide end cap */}
          <line x1="372" y1={SLIDER_Y - 9} x2="372" y2={SLIDER_Y + 9} />
        </g>

        {/* ---- crank wheel (rotating) ---- */}
        <g ref={wheelRef}>
          <circle className="solid" cx={CX} cy={CY} r={R} />
          {/* crank arm / spoke from centre to pin */}
          <line
            className="moving"
            x1={CX}
            y1={CY}
            x2={CX + R}
            y2={CY}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* counterweight opposite the pin */}
          <circle className="solid" cx={CX - R * 0.55} cy={CY} r={R * 0.34} />
          {/* crank pin */}
          <circle className="pin-glow" cx={CX + R} cy={CY} r="9" />
          <circle className="pin" cx={CX + R} cy={CY} r="6" />
          {/* pivot */}
          <circle className="pin" cx={CX} cy={CY} r="3.5" />
        </g>

        {/* ---- connecting rod ---- */}
        <line ref={rodRef} className="moving glow-line" strokeWidth="7" strokeLinecap="round" />

        {/* ---- slider / piston ---- */}
        <g ref={sliderRef}>
          <rect className="solid" x="-22" y="-15" width="44" height="30" rx="4" />
          <circle className="pin" cx="0" cy="0" r="6" />
        </g>

        {/* ---- labels ---- */}
        <g className="label">
          <text x={CX} y="372" textAnchor="middle">CRANK</text>
          <text x="376" y="372" textAnchor="end">SLIDER</text>
        </g>
      </Schematic>
    );
  },
);

CrankSlider.displayName = 'CrankSlider';
export default CrankSlider;
