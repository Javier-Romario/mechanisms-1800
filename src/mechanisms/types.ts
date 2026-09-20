import type { ForwardRefExoticComponent, RefAttributes } from 'react';

/** NEONDECK neon tones (mirrors the library's `NeonTone` union). */
export type Tone =
  | 'teal'
  | 'magenta'
  | 'yellow'
  | 'green'
  | 'violet'
  | 'orange'
  | 'red'
  | 'blue';

/** Imperative controls every mechanism exposes to the generic card shell. */
export interface MechanismHandle {
  /** Pause / resume the animation. */
  toggle(): void;
  /** Set playback speed multiplier (0.25 … 4). */
  setSpeed(mult: number): void;
  /** Jump back to the loop start and keep playing. */
  restart(): void;
  /** Current speed multiplier. */
  speed(): number;
  /** Whether the animation is currently playing. */
  running(): boolean;
}

export interface MechanismProps {
  /** Called with a live one-line readout (already throttled by the mechanism). */
  onReadout?: (text: string) => void;
}

export type MechanismComponent = ForwardRefExoticComponent<
  MechanismProps & RefAttributes<MechanismHandle>
>;

/** Static metadata rendered by the generic card shell. */
export interface MechanismDef {
  id: string;
  /** Book movement number, e.g. "MOVEMENT 014". */
  number: string;
  name: string;
  /** Short motion tag, e.g. "ROTARY → RECIPROCATING". */
  tag: string;
  tone: Tone;
  description: string;
  /** Everyday places this mechanism shows up. */
  uses: string;
  /** A clever, less-obvious application of the same motion. */
  genius: string;
  /** Ticker feed for the card edge marquee. */
  ticker: string[];
}
