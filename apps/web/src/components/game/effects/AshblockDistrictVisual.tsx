import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

const WINDOW_ROWS = [2.3, 4.8, 7.3, 9.8] as const;
const WINDOW_Z_OFFSETS = [-2.7, 0, 2.7] as const;

export function AshblockDistrictVisual({ stage }: AshblockDistrictVisualProps) {
  const neonRef = useRef<THREE.PointLight>(null);
  const memoryBeaconRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (neonRef.current) {
      neonRef.current.intensity = 0.42 + Math.sin(elapsed * 2.3) * 0.05;
    }

    if (memoryBeaconRef.current) {
      const memoryActive = stage === 'memory-trace' || stage === 'extraction';
      memoryBeaconRef.current.intensity = memoryActive
        ? 0.75 + Math.sin(elapsed * 3.2) * 0.12
        : 0.08;
    }
  });

  const windowColor = stage === 'memory-trace' ? '#d9c4ff' : '#f0a45d';

  return (
    <group name="ashblock-district-presentation" userData={{ presentationOnly: true }}>
      {BUILDINGS.map((building, buildingIndex) => (
        <group key={`ashblock-building-${buildingIndex}`}>
          <mesh
            name={`ashblock-stacked-masonry-${buildingIndex}`}
            position={[building.x, building.height / 2 - 0.05, building.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial color={building.tone} roughness={0.92} metalness={0.04} />
          </mesh>

          {WINDOW_ROWS.filter((y) => y < building.height - 1).flatMap((y, rowIndex) =>
            WINDOW_Z_OFFSETS.map((zOffset, columnIndex) => {
              const inwardFaceX = building.x < 0
                ? building.x + building.width / 2 + 0.015
                : building.x - building.width / 2 - 0.015;

              return (
                <mesh
                  key={`window-${buildingIndex}-${rowIndex}-${columnIndex}`}
                  position={[inwardFaceX, y, building.z + zOffset]}
                  rotation={[0, Math.PI / 2, 0]}
                >
                  <planeGeometry args={[1.05, 0.72]} />
                  <meshStandardMaterial
                    color={windowColor}
                    emissive={windowColor}
                    emissiveIntensity={stage === 'encounter' ? 0.32 : 0.52}
                    transparent
                    opacity={0.86}
                    depthWrite={false}
                  />
                </mesh>
              );
            })
          )}
        </group>
      ))}

      <group name="ashblock-elevated-infrastructure">
        <mesh position={[0, 7.2, 27]} castShadow receiveShadow>
          <boxGeometry args={[30, 0.65, 4.2]} />
          <meshStandardMaterial color="#30343b" roughness={0.78} metalness={0.28} />
        </mesh>
        {[-10, 10].map((x) => (
          <mesh key={`bridge-pier-${x}`} position={[x, 3.5, 27]} castShadow>
            <boxGeometry args={[1.2, 7, 1.4]} />
            <meshStandardMaterial color="#24272d" roughness={0.82} metalness={0.22} />
          </mesh>
        ))}
        <mesh position={[0, 7.72, 27]} rotation={[0, 0, 0]}>
          <boxGeometry args={[31, 0.18, 0.18]} />
          <meshStandardMaterial color="#7a8491" metalness={0.7} roughness={0.28} />
        </mesh>
      </group>

      <group name="ashblock-water-towers">
        {[
          [-10.5, 12.8, 8],
          [10.8, 15.2, 34],
        ].map(([x, y, z], index) => (
          <group key={`water-tower-${index}`} position={[x, y, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[1.5, 1.65, 2.4, 12]} />
              <meshStandardMaterial color="#3a3d43" roughness={0.68} metalness={0.34} />
            </mesh>
            {[-0.9, 0.9].flatMap((sx) =>
              [-0.9, 0.9].map((sz) => (
                <mesh key={`tower-leg-${sx}-${sz}`} position={[sx, -2.4, sz]}>
                  <cylinderGeometry args={[0.08, 0.08, 3.8, 6]} />
                  <meshStandardMaterial color="#555c66" metalness={0.62} roughness={0.38} />
                </mesh>
              ))
            )}
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
              <boxGeometry args={[2.8, 0.12, 1.8]} />
              <meshStandardMaterial color={String(color)} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.95, 0]}>
              <boxGeometry args={[2.2, 1.7, 1.3]} />
              <meshStandardMaterial color="#29282c" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      <group name="ashblock-murals-and-fang-control">
        <mesh position={[-9.48, 3.1, 11]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5.6, 3.4]} />
          <meshStandardMaterial
            color="#563071"
            emissive="#2360D1"
            emissiveIntensity={0.18}
            roughness={0.8}
          />
        </mesh>
        <mesh position={[9.48, 3.4, 15]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5.2, 3.1]} />
          <meshStandardMaterial
            color="#30333a"
            emissive="#E4511E"
            emissiveIntensity={0.16}
            roughness={0.78}
          />
        </mesh>

        {[5.5, 8.5].map((z, index) => (
          <group key={`fang-control-marker-${index}`} position={[index === 0 ? -6.8 : 6.8, 1.25, z]}>
            <mesh rotation={[0, 0, index === 0 ? -0.3 : 0.3]}>
              <coneGeometry args={[0.25, 1.4, 8]} />
              <meshStandardMaterial color="#C7C3BB" emissive="#4A2A7A" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.72, 0.08, 8, 20]} />
              <meshStandardMaterial color="#4A2A7A" emissive="#2360D1" emissiveIntensity={0.42} />
            </mesh>
          </group>
        ))}
      </group>

      <pointLight
        ref={neonRef}
        position={[-7.5, 3, 12]}
        color="#2360D1"
        intensity={0.42}
        distance={12}
        decay={2}
      />
      <pointLight
        ref={memoryBeaconRef}
        position={[0, 2.2, 5]}
        color="#a78bfa"
        intensity={0.08}
        distance={15}
        decay={2}
      />
    </group>
  );
}
