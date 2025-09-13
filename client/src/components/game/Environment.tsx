import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentProps {
  playerZ: number;
}

export default function Environment({ playerZ }: EnvironmentProps) {
  const roadTexture = useTexture("/textures/asphalt.png");
  const sidewalkTexture = useTexture("/textures/asphalt.png");
  
  // Configure texture repetition
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(2, 50);
  
  sidewalkTexture.wrapS = sidewalkTexture.wrapT = THREE.RepeatWrapping;
  sidewalkTexture.repeat.set(1, 50);
  
  // Generate city buildings
  const buildings = useMemo(() => {
    const buildingArray = [];
    const buildingCount = 20;
    
    for (let i = 0; i < buildingCount; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (15 + Math.random() * 10);
      const z = (i - 10) * 30 + Math.random() * 20;
      const height = 5 + Math.random() * 15;
      const width = 3 + Math.random() * 4;
      const depth = 3 + Math.random() * 4;
      
      buildingArray.push({
        id: `building_${i}`,
        position: [x, height / 2, z] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        color: `hsl(${200 + Math.random() * 60}, 30%, ${40 + Math.random() * 20}%)`
      });
    }
    
    return buildingArray;
  }, []);
  
  // Generate street props
  const streetProps = useMemo(() => {
    const props = [];
    const propCount = 15;
    
    for (let i = 0; i < propCount; i++) {
      const z = i * 25;
      const types = ['streetlight', 'tree', 'bench'];
      const type = types[Math.floor(Math.random() * types.length)];
      const side = Math.random() < 0.5 ? -1 : 1;
      
      props.push({
        id: `prop_${i}`,
        type,
        position: [side * 8, 0, z] as [number, number, number]
      });
    }
    
    return props;
  }, []);
  
  return (
    <group>
      {/* Road surface */}
      <mesh position={[0, -0.1, playerZ]} receiveShadow>
        <planeGeometry args={[20, 200]} />
        <meshLambertMaterial map={roadTexture} />
      </mesh>
      
      {/* Lane dividers */}
      {[-2, 2].map((x, i) => (
        <mesh key={`divider_${i}`} position={[x, 0, playerZ]}>
          <boxGeometry args={[0.2, 0.1, 200]} />
          <meshLambertMaterial color="#FFFF00" />
        </mesh>
      ))}
      
      {/* Sidewalks */}
      <mesh position={[-12, -0.05, playerZ]} receiveShadow>
        <planeGeometry args={[8, 200]} />
        <meshLambertMaterial map={sidewalkTexture} color="#888888" />
      </mesh>
      <mesh position={[12, -0.05, playerZ]} receiveShadow>
        <planeGeometry args={[8, 200]} />
        <meshLambertMaterial map={sidewalkTexture} color="#888888" />
      </mesh>
      
      {/* Buildings */}
      {buildings.map(building => (
        <mesh
          key={building.id}
          position={building.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={building.size} />
          <meshLambertMaterial color={building.color} />
        </mesh>
      ))}
      
      {/* Street props */}
      {streetProps.map(prop => (
        <group key={prop.id} position={prop.position}>
          {prop.type === 'streetlight' && (
            <>
              <mesh position={[0, 3, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 6]} />
                <meshLambertMaterial color="#555555" />
              </mesh>
              <mesh position={[0, 6, 0]} castShadow>
                <sphereGeometry args={[0.3]} />
                <meshLambertMaterial color="#FFFF88" />
              </mesh>
            </>
          )}
          
          {prop.type === 'tree' && (
            <>
              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 3]} />
                <meshLambertMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 4, 0]} castShadow>
                <sphereGeometry args={[1.5]} />
                <meshLambertMaterial color="#228B22" />
              </mesh>
            </>
          )}
          
          {prop.type === 'bench' && (
            <>
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[2, 0.2, 0.8]} />
                <meshLambertMaterial color="#654321" />
              </mesh>
              <mesh position={[0, 0.8, 0.3]} castShadow>
                <boxGeometry args={[2, 0.6, 0.1]} />
                <meshLambertMaterial color="#654321" />
              </mesh>
            </>
          )}
        </group>
      ))}
      
      {/* Skybox/Background */}
      <mesh position={[0, 20, playerZ]}>
        <planeGeometry args={[200, 40]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}
