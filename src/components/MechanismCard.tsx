import { useCallback, useRef, useState } from 'react';
import { NeoButton, NeoCard, TickerBoard } from '@javierromario/neondeck';
import type {
  MechanismComponent,
  MechanismDef,
  MechanismHandle,
} from '../mechanisms/types';

const SPEEDS = [0.5, 1, 2];

/**
 * Generic shell for every mechanism: NEONDECK glass card + ticker-board edge +
 * live readout + play / speed / restart controls. Mechanisms just implement
 * `MechanismHandle`; the chrome stays identical.
 */
export function MechanismCard({
  def,
  Component,
}: {
  def: MechanismDef;
  Component: MechanismComponent;
}) {
  const handleRef = useRef<MechanismHandle>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(1);

  // stable callback → mechanism effect is not recreated on re-render
  const onReadout = useCallback((text: string) => {
    if (readoutRef.current) readoutRef.current.textContent = text;
  }, []);

  const toggle = () => {
    handleRef.current?.toggle();
    setRunning(handleRef.current?.running() ?? true);
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    handleRef.current?.setSpeed(SPEEDS[next]);
  };

  const restart = () => {
    handleRef.current?.restart();
    setRunning(true);
  };

  return (
    <TickerBoard
      message={def.number}
      messageTone={def.tone}
      tickerLabel="1800 MECH"
      tickerItems={def.ticker}
      tickerTone={def.tone}
      tickerSpeed={22}
      showTopTicker
      showBottomTicker={false}
    >
      <NeoCard title={`${def.name} · ${def.tag}`} tone={def.tone}>
        <Component ref={handleRef} onReadout={onReadout} />

        <div className="mech-meta">
          <p className="mech-desc">{def.description}</p>

          <div className="mech-block">
            <span className="mech-block-label">// COMMON USES</span>
            <p className="mech-block-text">{def.uses}</p>
          </div>

          <div className="mech-block">
            <span className="mech-block-label">// GENIUS USE</span>
            <p className="mech-block-text">{def.genius}</p>
          </div>

          <span ref={readoutRef} className="mech-readout" aria-live="off">
            …
          </span>

          <div className="mech-controls">
            <NeoButton variant="glass" tone={def.tone} onClick={toggle}>
              {running ? '❚❚ HOLD' : '▶ RUN'}
            </NeoButton>
            <NeoButton variant="glass" tone={def.tone} onClick={cycleSpeed}>
              {SPEEDS[speedIdx]}×
            </NeoButton>
            <NeoButton variant="glass" tone={def.tone} onClick={restart}>
              ↺
            </NeoButton>
            <span className="spacer" />
            <span className="speed-badge">{def.tone.toUpperCase()}</span>
          </div>
        </div>
      </NeoCard>
    </TickerBoard>
  );
}
