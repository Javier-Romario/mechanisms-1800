# AGENTS.md — Mechanisms 1800 (Anime.js × NEONDECK)

Instructions for the agent when extending this project (e.g. adding mechanism
004+). Follow these, they encode the decisions already made.

## Stack

- React 19 + TypeScript + Vite
- Anime.js v4 — one scalar driver per mechanism; `onUpdate` writes SVG transforms
- NEONDECK — glass/neon `TickerBoard`, `NeoCard`, `NeoButton`, `NeoToggle`

## Hard rules (do not break)

1. **Square canvas.** Every mechanism renders into `viewBox="0 0 400 400"`.
2. **Safe zone `[24, 376]`.** All geometry — static *and* animated, at *every*
   frame — stays inside `[24, 376]` on both axes. NEONDECK cards chamfer their
   corners, so keep a 24px gutter. Verify over the full loop, not one frame.
3. **Labels inside the viewBox** (they live in the `<g className="label">`).
4. **Local-origin parts use `translate(cx cy) rotate(deg)`**, never
   `rotate(deg, cx, cy)` — the latter rotates *around* a point but leaves the
   part at the origin. This was the bug that put 002/003 off-canvas.
5. **No React render in the loop.** Set SVG attributes with `setAttribute`,
   update the readout via `textContent`, throttle it (every ~6–8 frames). No
   `useState`/`setState` per frame.
6. **Seamless loop.** The animated scalar must span `N` full periods so the
   pose at `t=0` equals the pose at `t=end` (e.g. 8 driver revs = 2 wheel revs
   for the Geneva, 12 teeth = 1 wheel rev for the ratchet).

## Component contract

Every mechanism is a `forwardRef` component exposing `MechanismHandle`
(`toggle`, `setSpeed`, `restart`, `speed`, `running`) — see
`src/mechanisms/types.ts`. The card chrome is generic (`MechanismCard.tsx`).

Skeleton to copy:

```tsx
import { forwardRef, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Schematic, deg, fmt, useMechanismHandle, type Driver } from './shared';
import type { MechanismHandle, MechanismProps } from './types';

const TWO_PI = Math.PI * 2;
const DURATION = 3000; // one seamless period

const MyMechanism = forwardRef<MechanismHandle, MechanismProps>(
  ({ onReadout }, ref) => {
    const partRef = useRef<SVGGElement>(null);
    const animRef = useRef<Driver | null>(null);
    useMechanismHandle(ref, animRef);

    useEffect(() => {
      const state = { t: 0 }; // animejs mutates this
      let frame = 0;

      const anim = animate(state, {
        t: [0, TWO_PI],
        duration: DURATION,
        ease: 'linear',
        loop: true,
        onUpdate: () => {
          const th = state.t;
          // ... compute geometry from th ...
          partRef.current?.setAttribute('transform', `translate(cx cy) rotate(${deg(th)})`);
          if (frame++ % 6 === 0) onReadout?.(`θ ${fmt(deg(th), 0)}°`);
        },
      });

      animRef.current = anim as unknown as Driver;
      return () => { anim.pause(); animRef.current = null; };
    }, [onReadout]); // keep onReadout stable upstream (useCallback)

    return (
      <Schematic>
        <g className="static">{/* frame, base, guides, pivot dots */}</g>
        <g ref={partRef}>{/* moving parts, drawn in local coords */}</g>
        <g className="label">
          <text x="…" y="372" textAnchor="middle">LABEL</text>
        </g>
      </Schematic>
    );
  },
);
MyMechanism.displayName = 'MyMechanism';
export default MyMechanism;
```

## Theme-aware style classes (`src/index.css`)

| class | use |
|---|---|
| `static` / `static-dim` | fixed frame (thin neutral stroke) |
| `moving` | moving outlines (tone-colored stroke) |
| `solid` | filled parts (semi-transparent tone fill + stroke) |
| `pin` / `pin-glow` | pivots / hot highlight + halo |
| `glow-line` / `glow-fill` | drop-shadow neon glow (add to line/filled path) |
| `label` | caption text |

Colors come from CSS vars (`--mech-*`, `--tone`, `--tone-soft`) so light/dark
just works. Never hardcode hex in an SVG.

## Registration

Add an entry to `src/mechanisms/index.ts` → `MECHANISMS` array:

```ts
{
  def: {
    id: 'kebab-case',
    number: 'MOVEMENT 004',
    name: 'Name',
    tag: 'INPUT → OUTPUT',      // motion tag
    tone: 'teal',               // one of the 8 neon tones
    description: '…',           // 1–2 sentences
    ticker: ['A', 'B', 'C'],    // marquee feed items
  },
  Component: MyMechanism,
}
```

## Verify before finishing

1. `npm run build` — typecheck + vite must pass.
2. **Bounds check** — confirm every part stays in `[24, 376]` over the full
   loop. The slider-crank max is *not* at θ=0; compute extrema numerically.
3. `npm run dev` — readout ticks, no console errors, toggle/pause/speed work.

## Gotchas

- `animate(obj, { t: [0, X] })` mutates `obj.t`; read it in `onUpdate`.
- `useMechanismHandle(ref, animRef)` wires the imperative handle lazily.
- `onReadout` must be referentially stable or the effect restarts the animation.
- The Geneva cross silhouette is an **even-odd fill path** (circle + notch
  circles + slot rects as subpaths), *not* a `<mask>` — masks resolve
  `maskContentUnits` against the parent space and bite when the group is
  transformed.
- Keep the bundle lean: do not import three.js / R3F (they are stubbed in
  `vite.config.ts` and tree-shaken).
