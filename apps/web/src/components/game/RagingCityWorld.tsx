import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EncounterZone {
  id: string;
  position: [number, number, number];
  radius: number;
  type: 'battle' | 'boss' | 'story' | 'loot';
  district: string;
  enemyLevel: number;
  triggered: boolean;
}

interface District {
  name: string;
  center: [number, number, number];
  radius: number;
  color: string;
  description: string;
}

const DISTRICTS: District[] = [
  { name: "Ashblock Heights", center: [0, 0, 0], radius: 80, color: "#ff6b35", description: "Vertical rooftops, Fang Syndicate territory" },
  { name: "Sector-7 Outskirts", center: [150, 0, 0], radius: 80, color: "#4a4a4a", description: "Collapsed infrastructure, first fusion site" },
  { name: "Neon Ward", center: [0, 0, 150], radius: 80, color: "#00ff88", description: "Colorful deception, speed trials" },
  { name: "Iron Market", center: [-150, 0, 0], radius: 80, color: "#8b4513", description: "Black market, moral choices" },
  { name: "The Undercrown", center: [0, 0, -150], radius: 80, color: "#4b0082", description: "Ancient ruins, Sabertooth myths" },
  { name: "Zenith Spires", center: [120, 0, 120], radius: 60, color: "#00bfff", description: "Gravity-distorted towers" },
  { name: "Erasure Fields", center: [-120, 0, -120], radius: 60, color: "#1a1a1a", description: "Reality deletion zones" },
  { name: "Memory Nexus", center: [0, 0, 0], radius: 30, color: "#9932cc", description: "All timelines converge" }
];

export default function RagingCityWorld({ onEncounter, onDistrictChange }: { onEncounter: (encounter: EncounterZone) => void; onDistrictChange?: (district: string) => void }) {
  const playerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [currentDistrict, setCurrentDistrict] = useState("Ashblock Heights");
  const [encounters, setEncounters] = useState<EncounterZone[]>([]);
  const velocity = useRef(new THREE.Vector3());
  
  const [, getKeys] = useKeyboardControls();
  
  const MOVE_SPEED = 20; // Slightly faster for demo feel
  const WORLD_SIZE = 400; // Larger demo space
  
  const generateEncounters = useMemo(() => {
    const zones: EncounterZone[] = [];
    let id = 0;
    
    DISTRICTS.forEach(district => {
      const numEncounters = Math.floor(8 + Math.random() * 8);
      
      for (let i = 0; i < numEncounters; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * district.radius * 0.8;
        const x = district.center[0] + Math.cos(angle) * dist;
        const z = district.center[2] + Math.sin(angle) * dist;
        
        const rand = Math.random();
        let type: 'battle' | 'boss' | 'story' | 'loot' = 'battle';
        if (rand > 0.95) type = 'boss';
        else if (rand > 0.85) type = 'story';
        else if (rand > 0.7) type = 'loot';
        
        zones.push({
          id: `enc-${id++}`,
          position: [x, 0, z],
          radius: type === 'boss' ? 8 : 5,
          type,
          district: district.name,
          enemyLevel: Math.floor(1 + Math.random() * 10),
          triggered: false
        });
      }
    });
    
    return zones;
  }, []);
  
  useEffect(() => {
    setEncounters(generateEncounters);
  }, [generateEncounters]);
  
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const keys = getKeys();
    const moveDir = new THREE.Vector3();
    
    if (keys.left) moveDir.x -= 1;
    if (keys.right) moveDir.x += 1;
    if (keys.jump) moveDir.z -= 1;
    if (keys.slide) moveDir.z += 1;
    
    if (moveDir.length() > 0) {
      moveDir.normalize();
      velocity.current.lerp(moveDir.multiplyScalar(MOVE_SPEED), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }
    
    const newX = playerRef.current.position.x + velocity.current.x * delta;
    const newZ = playerRef.current.position.z + velocity.current.z * delta;
    
    playerRef.current.position.x = Math.max(-WORLD_SIZE, Math.min(WORLD_SIZE, newX));
    playerRef.current.position.z = Math.max(-WORLD_SIZE, Math.min(WORLD_SIZE, newZ));
    
    setPlayerPos([playerRef.current.position.x, 0, playerRef.current.position.z]);
    
    const camOffset = new THREE.Vector3(0, 15, 25);
    camera.position.lerp(
      new THREE.Vector3(
        playerRef.current.position.x + camOffset.x,
        camOffset.y,
        playerRef.current.position.z + camOffset.z
      ),
      0.1
    );
    camera.lookAt(playerRef.current.position);
    
    let nearestDistrict: District = DISTRICTS[0]!;
    let nearestDist = Infinity;
    DISTRICTS.forEach(d => {
      const dist = Math.sqrt(
        Math.pow(playerRef.current!.position.x - d.center[0], 2) +
        Math.pow(playerRef.current!.position.z - d.center[2], 2)
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestDistrict = d;
      }
    });
    if (nearestDistrict && nearestDistrict.name !== currentDistrict) {
      setCurrentDistrict(nearestDistrict.name);
      onDistrictChange?.(nearestDistrict.name);
    }
    
    encounters.forEach((enc, idx) => {
      if (enc.triggered) return;
      
      const dist = Math.sqrt(
        Math.pow(playerRef.current!.position.x - enc.position[0], 2) +
        Math.pow(playerRef.current!.position.z - enc.position[2], 2)
      );
      
      if (dist < enc.radius) {
        setEncounters(prev => {
          const updated = [...prev];
          const existing = updated[idx];
          if (existing) {
            updated[idx] = { ...existing, triggered: true };
          }
          return updated;
        });
        onEncounter(enc);
      }
    });
  });
  
  const buildings = useMemo(() => {
    const b: Array<{ pos: [number, number, number]; size: [number, number, number]; color: string; damaged: boolean }> = [];
    
    for (let i = 0; i < 120; i++) {
      const x = (Math.random() - 0.5) * WORLD_SIZE * 2;
      const z = (Math.random() - 0.5) * WORLD_SIZE * 2;
      const height = 8 + Math.random() * 25;
      const width = 6 + Math.random() * 10;
      const depth = 6 + Math.random() * 10;
      
      let district: District = DISTRICTS[0]!;
      DISTRICTS.forEach(d => {
        const dist = Math.sqrt(Math.pow(x - d.center[0], 2) + Math.pow(z - d.center[2], 2));
        if (dist < d.radius) district = d;
      });
      
      b.push({
        pos: [x, height / 2, z],
        size: [width, height, depth],
        color: district?.color || "#4a4a4a",
        damaged: Math.random() > 0.4
      });
    }
    return b;
  }, []);
  
  const debris = useMemo(() => {
    const d: Array<{ pos: [number, number, number]; rot: number; scale: number }> = [];
    for (let i = 0; i < 200; i++) {
      d.push({
        pos: [(Math.random() - 0.5) * WORLD_SIZE * 2, 0.3, (Math.random() - 0.5) * WORLD_SIZE * 2],
        rot: Math.random() * Math.PI * 2,
        scale: 0.3 + Math.random() * 1.5
      });
    }
    return d;
  }, []);
  
  const streetLamps = useMemo(() => {
    const lamps: Array<{ pos: [number, number, number]; broken: boolean }> = [];
    for (let i = 0; i < 60; i++) {
      lamps.push({
        pos: [(Math.random() - 0.5) * WORLD_SIZE * 2, 0, (Math.random() - 0.5) * WORLD_SIZE * 2],
        broken: Math.random() > 0.3
      });
    }
    return lamps;
  }, []);
  
  return (
    <>
      <ambientLight intensity={0.15} color="#ff9966" />
      <directionalLight position={[50, 80, 30]} intensity={0.4} color="#ff6633" castShadow />
      <pointLight position={[0, 30, 0]} intensity={0.3} color="#ff4400" distance={200} />
      <hemisphereLight intensity={0.1} color="#ff8844" groundColor="#221100" />
      
      <fog attach="fog" args={["#1a0a00", 50, 300]} />
      <color attach="background" args={["#0a0500"]} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE * 2.5, WORLD_SIZE * 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      
      {DISTRICTS.map((district, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[district.center[0], 0.01, district.center[2]]}>
          <circleGeometry args={[district.radius, 32]} />
          <meshBasicMaterial color={district.color} transparent opacity={0.08} />
        </mesh>
      ))}
      
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial 
              color={b.damaged ? "#2a2a2a" : b.color} 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          {b.damaged && (
            <mesh position={[b.size[0] * 0.3, b.size[1] * 0.2, 0]}>
              <boxGeometry args={[b.size[0] * 0.4, b.size[1] * 0.3, b.size[2] * 0.3]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          )}
        </group>
      ))}
      
      {debris.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={[0, d.rot, 0]} castShadow>
          <boxGeometry args={[d.scale, d.scale * 0.5, d.scale]} />
          <meshStandardMaterial color="#3a3a3a" roughness={1} />
        </mesh>
      ))}
      
      {streetLamps.map((lamp, i) => (
        <group key={i} position={lamp.pos}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 6, 8]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          {!lamp.broken && (
            <pointLight position={[0, 6, 0]} intensity={0.2} color="#ffaa44" distance={15} />
          )}
        </group>
      ))}
      
      {encounters.filter(e => !e.triggered).map((enc) => (
        <EncounterMarker key={enc.id} encounter={enc} />
      ))}
      
      <group ref={playerRef} position={[0, 0, 0]}>
        <BeastKinPlayer />
      </group>
      
      <DistrictHUD district={currentDistrict} playerPos={playerPos} />
    </>
  );
}

function GLBPlayerModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/kaison_hero.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[2.5, 2.5, 2.5]}>
      <primitive object={clonedScene} />
      <pointLight position={[0, 1.5, 0.5]} intensity={0.4} color="#ff6600" distance={5} />
    </group>
  );
}

function BeastKinPlayerFallback() {
  const bodyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
    }
  });
  
  return (
    <group ref={bodyRef} position={[0, 1.2, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 0.9, 12, 16]} />
        <meshStandardMaterial color="#c4a67a" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#c4a67a" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.9, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#c4a67a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.18, 0.9, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#c4a67a" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.68, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[-0.08, 0.68, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[0.05, 0.52, 0.28]} rotation={[0.2, 0, 0.1]}>
        <coneGeometry args={[0.015, 0.12, 6]} />
        <meshStandardMaterial color="#fffff0" roughness={0.2} />
      </mesh>
      <mesh position={[-0.05, 0.52, 0.28]} rotation={[0.2, 0, -0.1]}>
        <coneGeometry args={[0.015, 0.12, 6]} />
        <meshStandardMaterial color="#fffff0" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[0.55, 0.45, 0.25]} />
        <meshStandardMaterial color="#ff6600" roughness={0.4} />
      </mesh>
      <pointLight position={[0, 0, 0.5]} intensity={0.3} color="#ff6600" distance={4} />
    </group>
  );
}

function BeastKinPlayer() {
  return (
    <Suspense fallback={<BeastKinPlayerFallback />}>
      <GLBPlayerModel />
    </Suspense>
  );
}

function EncounterMarker({ encounter }: { encounter: EncounterZone }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  const color = encounter.type === 'boss' ? '#ff0000' :
                encounter.type === 'story' ? '#9932cc' :
                encounter.type === 'loot' ? '#ffd700' : '#ff6600';
  
  return (
    <group position={encounter.position}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[encounter.radius * 0.3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={0.3} color={color} distance={encounter.radius * 2} />
    </group>
  );
}

function DistrictHUD({ district, playerPos }: { district: string; playerPos: [number, number, number] }) {
  return null;
}
