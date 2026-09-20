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
      ticker: ['SINUSOID', 'NO ROD', 'SLOT DRIVE', 'PURE LINEAR'],
    },
    Component: ScotchYoke,
  },
];
