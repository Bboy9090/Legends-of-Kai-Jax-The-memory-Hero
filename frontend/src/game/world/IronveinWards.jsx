import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

// Ironvein Wards - Industrial District
// "Factories, rail lines, moving machinery, vertical conveyors and cranes"

// Ground/Floor Platform
const Platform = ({ position, size, color = '#2a2a3a', isMoving = false, moveAxis = 'y', moveRange = 2, moveSpeed = 1 }) => {
  const meshRef = useRef();
  const startPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (isMoving && meshRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * moveSpeed) * moveRange;
      if (moveAxis === 'y') {
        meshRef.current.position.y = startPos.current.y + offset;
      } else if (moveAxis === 'x') {
        meshRef.current.position.x = startPos.current.x + offset;
      } else if (moveAxis === 'z') {
        meshRef.current.position.z = startPos.current.z + offset;
      }
    }
  });

  const halfArgs = [size[0] / 2, size[1] / 2, size[2] / 2];

  return (
    <RigidBody type={isMoving ? 'kinematicPosition' : 'fixed'} position={position} colliders={false}>
      <CuboidCollider args={halfArgs} />
      <mesh ref={meshRef} receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  );
};

// Industrial Pipe
const Pipe = ({ start, end, radius = 0.15, color = '#4a4a5a' }) => {
  const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const length = direction.length();
  const midPoint = new THREE.Vector3(...start).add(direction.multiplyScalar(0.5));
  
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return (
    <mesh position={midPoint.toArray()} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
    </mesh>
  );
};

// Steam Vent - Environmental hazard
const SteamVent = ({ position }) => {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.02;
      // Pulsing steam effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      particlesRef.current.scale.set(scale, scale * 1.5, scale);
    }
  });

  return (
    <group position={position}>
      {/* Vent base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Steam particles (simplified) */}
      <mesh ref={particlesRef} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.4, 1.5, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
          emissive="#aaddff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

// Conveyor Belt
const ConveyorBelt = ({ position, length = 10, width = 2, speed = 2, direction = 1 }) => {
  const beltRef = useRef();
  const textureOffset = useRef(0);

  useFrame((state, delta) => {
    textureOffset.current += delta * speed * direction;
    if (beltRef.current && beltRef.current.material.map) {
      beltRef.current.material.map.offset.x = textureOffset.current;
    }
  });

  return (
    <RigidBody type="fixed" position={position}>
      <mesh ref={beltRef} receiveShadow>
        <boxGeometry args={[length, 0.3, width]} />
        <meshStandardMaterial 
          color="#1a1a2a" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {/* Belt rails */}
      <mesh position={[0, 0.2, width/2 + 0.1]}>
        <boxGeometry args={[length, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFD60A" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, -width/2 - 0.1]}>
        <boxGeometry args={[length, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFD60A" metalness={0.6} />
      </mesh>
    </RigidBody>
  );
};

// Industrial Crane
const Crane = ({ position, height = 15 }) => {
  const armRef = useRef();

  useFrame((state) => {
    if (armRef.current) {
      armRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Tower */}
      <mesh position={[0, height/2 + 1, 0]} castShadow>
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial color="#FFD60A" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Rotating arm */}
      <group ref={armRef} position={[0, height + 1, 0]}>
        <mesh position={[4, 0, 0]} castShadow>
          <boxGeometry args={[10, 0.8, 0.8]} />
          <meshStandardMaterial color="#FF3B30" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Hook */}
        <mesh position={[8, -2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// Factory Building
const FactoryBuilding = ({ position, size = [10, 15, 8], color = '#2a2a3a' }) => {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[size[0]/2, size[1]/2, size[2]/2]} />
      <group>
        {/* Main structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* Windows */}
        {[-1, 0, 1].map((row) => (
          [-1, 1].map((col) => (
            <mesh 
              key={`${row}-${col}`}
              position={[col * size[0] * 0.3, row * size[1] * 0.25, size[2]/2 + 0.01]}
            >
              <planeGeometry args={[2, 3]} />
              <meshStandardMaterial 
                color="#64D2FF" 
                emissive="#64D2FF"
                emissiveIntensity={0.3}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))
        ))}
        {/* Roof details */}
        <mesh position={[0, size[1]/2 + 1, 0]} castShadow>
          <cylinderGeometry args={[1, 1.5, 2, 6]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.6} />
        </mesh>
      </group>
    </RigidBody>
  );
};

// Crate (destructible/interactive)
const Crate = ({ position }) => {
  return (
    <RigidBody position={position} mass={0.5}>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Crate markings */}
      <mesh position={[0, 0, 0.51]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="#FFD60A" />
      </mesh>
    </RigidBody>
  );
};

// Main Ironvein Wards Environment
export const IronveinWards = () => {
  return (
    <group>
      {/* Main Ground */}
      <Platform position={[0, -0.5, 0]} size={[60, 1, 60]} color="#1a1a2a" />
      
      {/* Secondary elevated platform */}
      <Platform position={[15, 3, 0]} size={[15, 0.5, 12]} color="#2a2a3a" />
      <Platform position={[-15, 5, 10]} size={[12, 0.5, 10]} color="#2a2a3a" />
      
      {/* Moving platforms */}
      <Platform 
        position={[0, 4, -15]} 
        size={[4, 0.5, 4]} 
        color="#FFD60A" 
        isMoving 
        moveAxis="x" 
        moveRange={8} 
        moveSpeed={0.8} 
      />
      <Platform 
        position={[20, 8, 5]} 
        size={[3, 0.5, 3]} 
        color="#64D2FF" 
        isMoving 
        moveAxis="y" 
        moveRange={4} 
        moveSpeed={1.2} 
      />

      {/* Conveyor belts */}
      <ConveyorBelt position={[-10, 0.15, -10]} length={12} width={3} speed={2} />
      <ConveyorBelt position={[10, 3.15, 0]} length={8} width={2} speed={1.5} direction={-1} />

      {/* Factory buildings */}
      <FactoryBuilding position={[-25, 7.5, -20]} size={[12, 15, 10]} />
      <FactoryBuilding position={[25, 10, -15]} size={[15, 20, 12]} color="#3a3a4a" />
      <FactoryBuilding position={[-20, 6, 20]} size={[10, 12, 8]} />
      <FactoryBuilding position={[20, 8, 20]} size={[14, 16, 10]} color="#2a3a4a" />

      {/* Cranes */}
      <Crane position={[-15, 0, -5]} height={12} />
      <Crane position={[18, 0, -20]} height={18} />

      {/* Steam vents (hazards) */}
      <SteamVent position={[-5, 0, 5]} />
      <SteamVent position={[8, 0, -8]} />
      <SteamVent position={[12, 3, 2]} />

      {/* Pipes */}
      <Pipe start={[-25, 5, -15]} end={[-10, 5, -15]} radius={0.3} />
      <Pipe start={[-10, 5, -15]} end={[-10, 0.5, -15]} radius={0.3} />
      <Pipe start={[20, 8, -10]} end={[20, 8, 10]} radius={0.25} />
      <Pipe start={[20, 8, 10]} end={[20, 2, 10]} radius={0.25} />

      {/* Crates for cover/interaction */}
      <Crate position={[3, 0.5, 3]} />
      <Crate position={[4, 0.5, 3]} />
      <Crate position={[3.5, 1.5, 3]} />
      <Crate position={[-8, 0.5, -5]} />
      <Crate position={[-7, 0.5, -5]} />
      <Crate position={[15, 3.5, -2]} />
      <Crate position={[16, 3.5, -2]} />

      {/* Ramps for vertical movement */}
      <RigidBody type="fixed" position={[10, 1.5, 5]} rotation={[0, 0, -0.3]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[8, 0.3, 3]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" position={[-12, 2.5, 10]} rotation={[0, Math.PI/4, -0.25]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10, 0.3, 3]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Warning stripes on edges */}
      {[[-30, 0, 0], [30, 0, 0], [0, 0, -30], [0, 0, 30]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, i < 2 ? Math.PI/2 : 0, 0]}>
          <boxGeometry args={[60, 0.1, 1]} />
          <meshStandardMaterial color="#FFD60A" />
        </mesh>
      ))}

    </group>
  );
};

export default IronveinWards;
