import type { MechanismComponent, MechanismDef } from './types';
import CrankSlider from './CrankSlider';
import GenevaDrive from './GenevaDrive';
import RatchetPawl from './RatchetPawl';
import FourBarLinkage from './FourBarLinkage';
import CamFollower from './CamFollower';
import ScotchYoke from './ScotchYoke';

export interface MechanismEntry {
  def: MechanismDef;
  Component: MechanismComponent;
}

/** Top three movements from Gardner D. Hiscox's "1800 Mechanical Movements". */
export const MECHANISMS: MechanismEntry[] = [
  {
    def: {
      id: 'crank-slider',
      number: 'MOVEMENT 001',
      name: 'Crank & Connecting Rod',
      tag: 'ROTARY → RECIPROCATING',
      tone: 'teal',
      description:
        'Continuous rotation of the crank is converted into straight-line sliding motion. The connecting rod closes the loop between the crank pin and the sliding block — the same linkage at the heart of every piston engine.',
      uses:
        "Piston engines, air compressors, reciprocating pumps, jigsaws and power hacksaws — anywhere a motor's spin becomes a straight push-pull.",
      genius:
        'Run it backwards: gang wave-buoys, footfall plates or piston bellows onto one crankshaft and irregular push-pull inputs sum into a single smooth rotary shaft — a generator that eats chaos and spins a flywheel.',
      ticker: ['STROKE 110', 'PISTON CYCLE', 'ROTARY INPUT', 'LINEAR OUTPUT'],
    },
    Component: CrankSlider,
  },
  {
    def: {
      id: 'geneva-drive',
      number: 'MOVEMENT 002',
      name: 'Geneva Drive',
      tag: 'ROTARY → INTERMITTENT',
      tone: 'magenta',
      description:
        'A driven pin on the rotating disc drops into one of four slots and indexes the wheel exactly one quarter-turn, then a locking crescent holds it still. Watch and clock escapements, and film projectors, are built on this motion.',
      uses:
        'Film projectors advance one frame per index; watch escapements, assembly-line index tables and printing presses all need this exact stop-go rotation.',
      genius:
        'The dwell is free sample-and-hold. Index a sensor, gate a valve or expose a frame during the stationary window and the machine reads a rock-solid value every cycle — mechanical debounce, no electronics.',
      ticker: ['4-SLOT INDEX', '1/4 TURN', 'LOCK CRESCENT', 'DWELL'],
    },
    Component: GenevaDrive,
  },
  {
    def: {
      id: 'ratchet-pawl',
      number: 'MOVEMENT 003',
      name: 'Ratchet & Pawl',
      tag: 'ONE-WAY · INTERMITTENT',
      tone: 'yellow',
      description:
        'An oscillating lever advances the wheel one tooth per stroke; the pawl slips on the return while a holding pawl clicks down to block reverse. Winches, jacks and clock springs all depend on it.',
      uses:
        'Socket wrenches, winches and hoists, seatbelt retractors, clock springs and zip ties — anything that must move one way and never unwind.',
      genius:
        "Mate it to a seismic mass and every vibration banks one tooth into a wound spring — a passive accumulator that stores ambient jiggle until there's enough to do real work.",
      ticker: ['12 TEETH', 'ONE-WAY', 'HOLDING PAWL', 'CLICK-CLACK'],
    },
    Component: RatchetPawl,
  },
  {
    def: {
      id: 'four-bar-linkage',
      number: 'MOVEMENT 004',
      name: 'Four-Bar Linkage',
      tag: 'ROTARY → OSCILLATING',
      tone: 'green',
      description:
        'A Grashof crank-rocker: the crank turns a full circle while the coupler rocks the follower through a limited arc. Shortest + longest link ≤ sum of the other two — the condition that lets the crank spin freely.',
      uses:
        'Car suspensions, windshield wipers, oil-well pumpjacks, walking beams, door closers and steering linkages — four pins, infinite paths.',
      genius:
        'Retune the link lengths and the rocker\'s arc becomes a leg: a Chebyshev-style four-bar steps on a near-straight footpath, so one motor at the crank walks a robot — no knee actuator, no code.',
      ticker: ['GRASHOF', 'CRANK-ROCKER', '4 LINKS', 'ROCKER ARC'],
    },
    Component: FourBarLinkage,
  },
  {
    def: {
      id: 'cam-follower',
      number: 'MOVEMENT 005',
      name: 'Cam & Follower',
      tag: 'ROTARY → RECIPROCATING',
      tone: 'orange',
      description:
        'An eccentric cam converts constant rotation into a follower stroke of 2·eccentricity. The profile — here the simplest offset circle — encodes the motion law; real cams shape it to any timing you need.',
      uses:
        'Engine camshafts, sewing-machine stitch timing, punch presses, mechanical music boxes and automata — a cam is a motion law cast in metal.',
      genius:
        'The cam is a mechanical lookup table. Shape the profile to the solution of any equation — a heartbeat waveform drives a CPR trainer, an espresso pressure curve opens a valve, a melody plucks a comb.',
      ticker: ['ECCENTRIC', 'LIFT 2e', 'ROLLER', 'CAM PROFILE'],
    },
    Component: CamFollower,
  },
  {
    def: {
      id: 'scotch-yoke',
      number: 'MOVEMENT 006',
      name: 'Scotch Yoke',
      tag: 'ROTARY → SINUSOIDAL',
      tone: 'blue',
      description:
        'A crank pin slides in a straight slot and drives the yoke in pure simple-harmonic motion — no connecting rod, no side thrust. The classic drive for pumps and small compressors.',
      uses:
        'Steam-engine valves, air and vacuum pumps, Stirling engines and lab shakers — pure sine motion with zero side thrust.',
      genius:
        "Stack two yokes 90° out of phase and two sines draw a Lissajous figure — a pen plotter with no gears and no backlash, tracing circles, ellipses and figure-eights from one crankshaft.",
      ticker: ['SINUSOID', 'NO ROD', 'SLOT DRIVE', 'PURE LINEAR'],
    },
    Component: ScotchYoke,
  },
];
