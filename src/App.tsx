import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { NeoToggle } from '@javierromario/neondeck';
import { useTheme } from './theme';
import { MECHANISMS } from './mechanisms';
import { MechanismCard } from './components/MechanismCard';

export default function App() {
  const { theme, toggle } = useTheme();

  // Entrance flare: cards rise + fade in with a stagger.
  useEffect(() => {
    const anim = animate('.mech-cell', {
      y: [28, 0],
      opacity: [0, 1],
      duration: 700,
      ease: 'outQuad',
      delay: stagger(110),
    });
    return () => {
      anim.pause();
    };
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◢◤ 1800 MECHANISMS</span>
          <span className="brand-sub">Anime.js × NEONDECK</span>
        </div>
        <NeoToggle
          label={theme === 'dark' ? 'DARK' : 'LIGHT'}
          tone={theme === 'dark' ? 'yellow' : 'teal'}
          checked={theme === 'dark'}
          onToggle={(on) => {
            const want = on ? 'dark' : 'light';
            if (want !== theme) toggle();
          }}
        />
      </header>

      <section className="hero">
        <h1>
          <span className="accent">Classic mechanisms,</span> animated as neon
          schematics.
        </h1>
        <p>
          Three movements from Gardner D. Hiscox&apos;s{' '}
          <strong>1800 Mechanical Movements</strong>, re-drawn as live SVG
          linkages and driven by <strong>Anime.js</strong> — skinned with the{' '}
          <strong>NEONDECK</strong> glass-and-neon component library. Every
          drawing runs on a single rAF loop; the parts are real geometry, not
          sprites.
        </p>
      </section>

      <main className="mech-grid">
        {MECHANISMS.map(({ def, Component }) => (
          <div className="mech-cell" key={def.id}>
            <MechanismCard def={def} Component={Component} />
          </div>
        ))}
      </main>

      <footer className="footer">
        <span>
          Source movements: <em>1800 Mechanical Movements, Devices and
          Appliances</em> — Gardner D. Hiscox.
        </span>
        <span>
          Built with <a href="https://animejs.com">Anime.js</a> ·{' '}
          <a href="https://github.com/javier-romario/neondeck">NEONDECK</a>
        </span>
      </footer>
    </div>
  );
}
