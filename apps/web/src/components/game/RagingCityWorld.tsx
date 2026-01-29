import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
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

export default function RagingCityWorld({ onEncounter }: { onEncounter: (encounter: EncounterZone) => void }) {
  const playerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [currentDistrict, setCurrentDistrict] = useState("Ashblock Heights");
  const [encounters, setEncounters] = useState<EncounterZone[]>([]);
  const velocity = useRef(new THREE.Vector3());
  
  const [, getKeys] = useKeyboardControls();
  
  const MOVE_SPEED = 15;
  const WORLD_SIZE = 300;
  
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
    
    const camOffset = new THREE.Vector3(0, 12, 18);
    camera.position.lerp(
      new THREE.Vector3(
        playerRef.current.position.x + camOffset.x,
        camOffset.y,
        playerRef.current.position.z + camOffset.z
      ),
      0.08
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
        <group key={enc.id} position={enc.position}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[enc.radius * 0.3, 16, 16]} />
            <meshBasicMaterial 
              color={
                enc.type === 'boss' ? '#ff0000' :
                enc.type === 'story' ? '#9932cc' :
                enc.type === 'loot' ? '#ffd700' : '#ff6600'
              }
              transparent
              opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.2}
            />
          </mesh>
          <pointLight 
            position={[0, 2, 0]} 
            intensity={0.3} 
            color={
              enc.type === 'boss' ? '#ff0000' :
              enc.type === 'story' ? '#9932cc' :
              enc.type === 'loot' ? '#ffd700' : '#ff6600'
            }
            distance={enc.radius * 2}
          />
        </group>
      ))}
      
      <group ref={playerRef} position={[0, 0, 0]}>
        <group position={[0, 1.2, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#e0c8b0" roughness={0.5} />
          </mesh>
          <mesh position={[0.15, 0.95, 0.25]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          <mesh position={[-0.15, 0.95, 0.25]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.8, 0.1, 0.5]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.3} />
          </mesh>
          <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#00ffff" distance={3} />
        </group>
      </group>
      
      <DistrictHUD district={currentDistrict} playerPos={playerPos} />
    </>
  );
}

function DistrictHUD({ district, playerPos }: { district: string; playerPos: [number, number, number] }) {
  return null;
}
