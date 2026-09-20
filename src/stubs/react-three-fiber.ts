/**
 * Build-time stub for the optional `@react-three/fiber` peer dependency.
 * NEONDECK's `Hologram` / `NeonTunnel` components import these symbols, but
 * this app never renders them — the stub only exists so the barrel module can
 * be resolved and the unused components tree-shaken away. No three.js code
 * ships in the bundle.
 */
export const Canvas = () => null;
export const useFrame = () => {};
export default { Canvas, useFrame };
