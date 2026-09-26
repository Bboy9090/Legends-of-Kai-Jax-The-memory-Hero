type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface AshblockDistrictVisualProps {
  stage: MissionStage;
}

const BUILDINGS = [
  { x: -13, z: -8, width: 7, depth: 10, height: 12, tone: '#26242b' },
  { x: 13, z: -3, width: 7, depth: 12, height: 15, tone: '#222832' },
  { x: -14, z: 10, width: 8, depth: 11, height: 17, tone: '#2d292d' },
  { x: 14, z: 14, width: 8, depth: 13, height: 13, tone: '#242934' },
  { x: -13, z: 30, width: 7, depth: 12, height: 14, tone: '#29262c' },
  { x: 13, z: 34, width: 7, depth: 11, height: 18, tone: '#232936' },
] as const;

export function AshblockDistrictVisual({ stage }: AshblockDistrictVisualProps) {
  const windowColor = stage === 'memory-trace' || stage === 'extraction'
    ? '#c9b8f4'
    : '#d99052';
  const windowIntensity = stage === 'encounter' ? 0.24 : 0.4;

  return (
    <group name="ashblock-district-presentation" userData={{ presentationOnly: true }}>
      {BUILDINGS.map((building, buildingIndex) => {
        const inwardFaceX = building.x < 0
          ? building.x + building.width / 2 + 0.02
          : building.x - building.width / 2 - 0.02;

        return (
          <group key={`ashblock-building-${buildingIndex}`}>
            <mesh
              name={`ashblock-stacked-masonry-${buildingIndex}`}
              position={[building.x, building.height / 2 - 0.05, building.z]}
            >
              <boxGeometry args={[building.width, building.height, building.depth]} />
              <meshStandardMaterial color={building.tone} roughness={0.94} metalness={0.03} />
            </mesh>

            {[3.2, 6.4, 9.6].filter((y) => y < building.height - 1).map((y, stripIndex) => (
              <mesh
                key={`window-strip-${buildingIndex}-${stripIndex}`}
                position={[inwardFaceX, y, building.z]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[Math.max(3.2, building.depth - 2.2), 0.42]} />
                <meshBasicMaterial
                  color={windowColor}
                  transparent
                  opacity={0.62}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      <group name="ashblock-elevated-infrastructure">
        <mesh position={[0, 7.2, 27]}>
          <boxGeometry args={[30, 0.65, 4.2]} />
          <meshStandardMaterial color="#30343b" roughness={0.8} metalness={0.24} />
        </mesh>
        {[-10, 10].map((x) => (
          <mesh key={`bridge-pier-${x}`} position={[x, 3.5, 27]}>
            <boxGeometry args={[1.2, 7, 1.4]} />
            <meshStandardMaterial color="#24272d" roughness={0.84} metalness={0.18} />
          </mesh>
        ))}
        <mesh position={[0, 7.72, 27]}>
          <boxGeometry args={[31, 0.16, 0.16]} />
          <meshBasicMaterial color="#7a8491" />
        </mesh>
      </group>

      <group name="ashblock-water-towers">
        {[
          [-10.5, 12.8, 8],
          [10.8, 15.2, 34],
        ].map(([x, y, z], index) => (
          <group key={`water-tower-${index}`} position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[1.5, 1.65, 2.4, 10]} />
              <meshStandardMaterial color="#3a3d43" roughness={0.72} metalness={0.28} />
            </mesh>
            {[-0.75, 0.75].map((sx) => (
              <mesh key={`tower-leg-${sx}`} position={[sx, -2.4, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 3.8, 5]} />
                <meshBasicMaterial color="#555c66" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <group name="ashblock-market-life-signs">
        {[
          [-8.6, 1.35, -1, '#a34c32'],
          [8.6, 1.35, 12, '#315b78'],
          [-8.6, 1.35, 23, '#6a3d74'],
        ].map(([x, y, z, color], index) => (
          <group key={`awning-${index}`} position={[Number(x), Number(y), Number(z)]}>
            <mesh rotation={[0.14, 0, Number(x) < 0 ? -0.08 : 0.08]}>
              <boxGeometry args={[2.8, 0.1, 1.8]} />
              <meshBasicMaterial color={String(color)} />
            </mesh>
            <mesh position={[0, -0.95, 0]}>
              <boxGeometry args={[2.2, 1.7, 1.3]} />
              <meshStandardMaterial color="#29282c" roughness={0.92} />
            </mesh>
          </group>
        ))}
      </group>

      <group name="ashblock-murals-and-fang-control">
        <mesh position={[-9.48, 3.1, 11]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5.6, 3.4]} />
          <meshBasicMaterial color="#563071" />
        </mesh>
        <mesh position={[9.48, 3.4, 15]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5.2, 3.1]} />
          <meshBasicMaterial color="#7a3b28" />
        </mesh>

        {[5.5, 8.5].map((z, index) => (
          <group key={`fang-control-marker-${index}`} position={[index === 0 ? -6.8 : 6.8, 1.25, z]}>
            <mesh rotation={[0, 0, index === 0 ? -0.3 : 0.3]}>
              <coneGeometry args={[0.25, 1.4, 7]} />
              <meshBasicMaterial color="#C7C3BB" />
            </mesh>
            <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.72, 0.08, 6, 16]} />
              <meshBasicMaterial color="#4A2A7A" />
            </mesh>
          </group>
        ))}
      </group>

      <mesh position={[0, 0.03, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.35, 24]} />
        <meshBasicMaterial
          color={stage === 'memory-trace' || stage === 'extraction' ? '#8b5cf6' : '#3c3155'}
          transparent
          opacity={stage === 'memory-trace' || stage === 'extraction' ? 0.52 : 0.14}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
