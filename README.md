# 1800 Mechanisms · Anime.js × NEONDECK

Three classic movements from Gardner D. Hiscox's **1800 Mechanical Movements,
Devices and Appliances**, re-drawn as live SVG linkages and driven by
[Anime.js](https://animejs.com) — skinned with the
[NEONDECK](https://github.com/javier-romario/neondeck) glass-and-neon component
library.

## Movements

| # | Mechanism | Motion |
|---|-----------|--------|
| 001 | Crank & Connecting Rod | rotary → reciprocating |
| 002 | Geneva Drive | rotary → intermittent rotary |
| 003 | Ratchet & Pawl | one-way intermittent |
| 004 | Four-Bar Linkage | rotary → oscillating |
| 005 | Cam & Follower | rotary → reciprocating |
| 006 | Scotch Yoke | rotary → sinusoidal linear |

Each mechanism is a self-contained component that exposes a small
`MechanismHandle` (`toggle` / `setSpeed` / `restart`). The card chrome — NEONDECK
`TickerBoard` + `NeoCard`, live readout, and controls — is shared and generic:
add a new mechanism by dropping in one component and one registry entry.

### Canvas rule

Every mechanism draws into a **square `0 0 400 400`** SVG and keeps all
geometry — static and animated, at any frame — inside the **safe zone
`[24, 376]`** on both axes. NEONDECK cards chamfer their corners, so the 24px
gutter guarantees nothing ever clips against an edge or a cut corner.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Anime.js v4** — every linkage runs on a single rAF loop; parts are real
  geometry computed in the `onUpdate` callback (no sprites, no re-renders).
- **NEONDECK** — cyberpunk glass/neon components, themed via CSS custom
  properties, with built-in **light/dark** mode (`html[data-theme]`).

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static site → dist/
npm run preview    # serve the production build
```

## Deploy to GitHub Pages

The build uses `base: './'`, so `dist/` works from any sub-path. Publish the
`dist/` folder to the `gh-pages` branch:

```sh
npm run deploy     # build + gh-pages -d dist
```

Or point GitHub Pages at the `/dist` directory of the repo.

## Performance notes

- SVG transforms are written directly via `setAttribute` — no React re-renders
  on the animation loop; the live readout also writes `textContent` directly.
- NEONDECK's optional three.js components are stubbed at build time and
  tree-shaken away — no three.js ships in the bundle (~87 kB gzip JS).
- Theme is a single `data-theme` attribute flip over CSS custom properties.
