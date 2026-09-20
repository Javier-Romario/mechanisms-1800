import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import {
  Schematic,
  deg,
  fmt,
  polar,
  rad,
  useMechanismHandle,
  type Driver,
} from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 02 — Geneva Drive (Maltese cross).
 * Continuous rotary input → intermittent rotary output. The driver pin indexes
 * the four-slotted wheel one quarter-turn per revolution; a locking crescent
 * (the driver disc) holds the wheel at rest between indexes.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   driver D = (134, 200), wheel G = (274, 200), centre distance a = 140
 *   pin orbit radius r = a·sin(π/4) = 99, wheel radius R = a·cos(π/4) = 99
 *   engagement half-angle β = π/4 (45°) → one index per driver revolution
 *
 * Driven angle (exact Geneva closure):
 *   α = −π − atan2(r·sinθ, a − r·cosθ)   during engagement (θ ∈ [−β, β])
 *   α = −5π/4 − i·(π/2)                  during dwell (i = completed indexes)
 */
const A = 140; // centre distance
const RP = A * Math.sin(Math.PI / 4); // 99 — pin orbit radius
const RCROSS = A * Math.cos(Math.PI / 4); // 99 — wheel radius
const RDISC = 62; // locking disc radius
const DX = 134; // driver centre
const DY = 200;
const GX = 274; // Geneva wheel centre
const GY = 200;
const BETA = Math.PI / 4;
const TWO_PI = Math.PI * 2;
const REVS = 8; // 8 driver revs = 2 full wheel revs → seamless loop
const DURATION = REVS * 1150;

// driver locking disc: circle with a 90° wedge cut out on the pin side (+x)
const gapHalf = rad(45);
const ds = polar(0, 0, RDISC, gapHalf);
const de = polar(0, 0, RDISC, TWO_PI - gapHalf);
const DISC_PATH = `M ${fmt(ds.x, 2)} ${fmt(ds.y, 2)} A ${RDISC} ${RDISC} 0 1 1 ${fmt(de.x, 2)} ${fmt(de.y, 2)} Z`;

// Geneva wheel silhouette: a circle with four concave lock notches and four
// radial slots cut via even-odd subpaths (holes = overlapping regions).
const circle = (cx: number, cy: number, r: number) =>
  `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
const rect = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;

const CROSS_PATH = [
  circle(0, 0, RCROSS),
  circle(RCROSS, RCROSS, RDISC),
  circle(-RCROSS, RCROSS, RDISC),
  circle(-RCROSS, -RCROSS, RDISC),
  circle(RCROSS, -RCROSS, RDISC),
  rect(14, -9, 92, 18),
  rect(-106, -9, 92, 18),
  rect(-9, 14, 18, 92),
  rect(-9, -106, 18, 92),
].join(' ');

const GenevaDrive = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const driverRef = useRef<SVGGElement>(null);
    const crossRef = useRef<SVGGElement>(null);
    const animRef = useRef<Driver | null>(null);
    useMechanismHandle(ref, animRef);

    useEffect(() => {
      const state = { t: 0 };
      let frame = 0;

      const anim = animate(state, {
        t: [0, REVS * TWO_PI],
        duration: DURATION,
        ease: 'linear',
        loop: true,
        onUpdate: () => {
          const T = state.t;
          const i = Math.floor(T / TWO_PI);
          const u = T - i * TWO_PI; // [0, 2π)
          const theta = u - BETA; // pin angle mod 2π
          const engaged = u < 2 * BETA;

          let alpha: number;
          if (engaged) {
            alpha =
              -Math.PI -
              Math.atan2(RP * Math.sin(theta), A - RP * Math.cos(theta)) -
              i * (Math.PI / 2);
          } else {
            alpha = (-5 * Math.PI) / 4 - i * (Math.PI / 2);
          }

          driverRef.current?.setAttribute(
            'transform',
            `translate(${DX} ${DY}) rotate(${deg(T - BETA)})`,
          );
          crossRef.current?.setAttribute(
            'transform',
            `translate(${GX} ${GY}) rotate(${deg(alpha)})`,
          );

          if (frame++ % 8 === 0) {
            const step = ((i % 4) + 4) % 4 + 1;
            onReadout?.(
              `index ${step}/4 · driver ${fmt(deg(T - BETA), 0)}° · wheel ${fmt((deg(alpha) % 360 + 360) % 360, 0)}°`,
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
          <line x1="40" y1={DY} x2="376" y2={DY} strokeWidth="1" />
          <circle cx={DX} cy={DY} r="4" />
          <circle cx={GX} cy={GY} r="4" />
        </g>

        {/* ---- driver (rotating) ---- */}
        <g ref={driverRef}>
          <path d={DISC_PATH} className="solid glow-fill" />
          {/* boss from disc rim to pin */}
          <line
            className="moving"
            x1={RDISC}
            y1="0"
            x2={RP}
            y2="0"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle className="pin-glow" cx={RP} cy="0" r="10" />
          <circle className="pin" cx={RP} cy="0" r="6.5" />
          <circle className="pin" cx="0" cy="0" r="3.5" />
        </g>

        {/* ---- Geneva wheel (indexing) ---- */}
        <g ref={crossRef}>
          <path d={CROSS_PATH} fillRule="evenodd" className="solid glow-fill" />
          <circle className="moving" r="16" fill="none" />
          <circle className="pin" r="4" />
        </g>

        {/* ---- labels ---- */}
        <g className="label">
          <text x={DX} y="372" textAnchor="middle">DRIVER</text>
          <text x={GX} y="372" textAnchor="middle">GENEVA WHEEL</text>
        </g>
      </Schematic>
    );
  },
);

GenevaDrive.displayName = 'GenevaDrive';
export default GenevaDrive;
