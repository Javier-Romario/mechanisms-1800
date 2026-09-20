import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

/*
 * Mechanism 05 — Cam & Follower.
 * Constant rotation → reciprocating output. An eccentric (offset) circular cam
 * turns full circle; a roller follower rides the cam top and bobs through a
 * stroke of 2·eccentricity. Real cams reshape the profile to encode any motion
 * law — here the simplest: an offset circle.
 *
 * Geometry (viewBox 0 0 400 400, safe zone [24, 376]):
 *   cam pivot O = (200, 230), eccentricity e = 30, cam radius R = 60
 *   follower roller radius 12, stem length 80
 *
 * Roller contact y = O.y + e·sinθ − R − r_roller  (flat follower on cam top).
 */
const OX = 200;
const OY = 230;
const E = 30; // eccentricity
const RCAM = 60;
const RROLL = 12;
const STEM = 80;
const TWO_PI = Math.PI * 2;
const DURATION = 3600;

const CamFollower = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const camRef = useRef<SVGGElement>(null);
    const followerRef = useRef<SVGGElement>(null);
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
          // roller centre y — rides the cam top
          const rollerY = OY + E * sin - RCAM - RROLL;

          camRef.current?.setAttribute(
            'transform',
            `translate(${OX} ${OY}) rotate(${deg(th)})`,
          );
          followerRef.current?.setAttribute(
            'transform',
            `translate(${OX} ${rollerY})`,
          );

          if (frame++ % 6 === 0) {
            onReadout?.(`θ ${fmt(deg(th), 0)}° · lift ${fmt(E * sin, 1)}`);
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
          <line x1="120" y1="330" x2="330" y2="330" strokeWidth="3" />
          {/* cam pedestal */}
          <line x1={OX} y1={OY} x2={OX} y2="330" />
          {/* follower guide rails */}
          <line x1="150" y1="28" x2="150" y2="120" />
          <line x1="250" y1="28" x2="250" y2="120" />
          {/* guide top bracket */}
          <line x1="150" y1="28" x2="250" y2="28" />
        </g>

        {/* ---- cam (rotating eccentric disc) ---- */}
        <g ref={camRef}>
          {/* throw from shaft to disc centre */}
          <line className="moving" x1="0" y1="0" x2={E} y2="0" strokeWidth="4" />
          {/* the eccentric disc */}
          <circle className="solid glow-fill" cx={E} cy="0" r={RCAM} />
          {/* shaft hole at the pivot */}
          <circle className="moving" cx="0" cy="0" r="9" fill="none" />
          <circle className="pin" cx="0" cy="0" r="4" />
        </g>

        {/* ---- follower (roller + stem + cap) ---- */}
        <g ref={followerRef}>
          {/* roller */}
          <circle className="solid" cx="0" cy="0" r={RROLL} />
          <circle className="pin" cx="0" cy="0" r="4" />
          {/* stem up to cap */}
          <line className="moving" x1="0" y1="0" x2="0" y2={-STEM} strokeWidth="6" strokeLinecap="round" />
          {/* cap */}
          <rect className="solid" x="-34" y={-STEM - 12} width="68" height="12" rx="3" />
        </g>

        {/* ---- labels ---- */}
        <g className="label">
          <text x={OX} y="372" textAnchor="middle">CAM</text>
          <text x="300" y="60" textAnchor="start">FOLLOWER</text>
        </g>
      </Schematic>
    );
  },
);

CamFollower.displayName = 'CamFollower';
export default CamFollower;
