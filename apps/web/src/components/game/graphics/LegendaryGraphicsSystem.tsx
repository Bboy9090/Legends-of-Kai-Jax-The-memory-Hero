/**
 * Lighting rig for battle and character preview.
 * No postprocessing deps — keeps the playable prototype lightweight.
 */
export function LegendaryLightingRig() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-4, 6, 4]} intensity={0.4} />
      <pointLight position={[0, 6, 4]} intensity={0.3} distance={25} />
    </>
  );
}
