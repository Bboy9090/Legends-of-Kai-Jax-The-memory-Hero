import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentProps {
  playerZ: number;
}

export default function Environment({ playerZ }: EnvironmentProps) {
  const floorTexture = useTexture("/textures/wood.jpg"); // Dad's apartment floor
  const carpetTexture = useTexture("/textures/wood.jpg"); // For the play areas
  
  // Configure texture repetition for apartment floor
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 20); // Apartment hallway feel
  
  carpetTexture.wrapS = carpetTexture.wrapT = THREE.RepeatWrapping;
  carpetTexture.repeat.set(2, 20);
  
  // Generate apartment furniture (couch, coffee table, etc.)
  const furniture = useMemo(() => {
    const furnitureArray = [];
    const furnitureCount = 12;
    
    for (let i = 0; i < furnitureCount; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (8 + Math.random() * 6); // Closer to apartment walls
      const z = (i - 6) * 25 + Math.random() * 15;
      
      // Different furniture types
      const furnitureTypes = ['couch', 'coffee_table', 'tv_stand', 'bookshelf'];
      const type = furnitureTypes[Math.floor(Math.random() * furnitureTypes.length)];
      
      let size, height, color;
      switch (type) {
        case 'couch':
          size = [3, 1, 1.5];
          height = 0.5;
          color = '#8B4513'; // Brown
          break;
        case 'coffee_table':
          size = [2, 0.8, 1];
          height = 0.4;
          color = '#654321'; // Dark brown
          break;
        case 'tv_stand':
          size = [4, 1.5, 1];
          height = 0.75;
          color = '#2F4F4F'; // Dark slate gray
          break;
        case 'bookshelf':
          size = [1.5, 4, 0.8];
          height = 2;
          color = '#8B4513'; // Brown
          break;
        default:
          size = [2, 1, 1];
          height = 0.5;
          color = '#8B4513';
      }
      
      furnitureArray.push({
        id: `furniture_${i}`,
        type,
        position: [x, height, z] as [number, number, number],
        size: size as [number, number, number],
        color
      });
    }
    
    return furnitureArray;
  }, []);
  
  // Generate apartment items (toys, pillows, etc.)
  const apartmentItems = useMemo(() => {
    const items = [];
    const itemCount = 10;
    
    for (let i = 0; i < itemCount; i++) {
      const z = i * 30;
      const types = ['toy_car', 'pillow', 'lamp', 'plant'];
      const type = types[Math.floor(Math.random() * types.length)];
      const side = Math.random() < 0.5 ? -1 : 1;
      
      items.push({
        id: `item_${i}`,
        type,
        position: [side * 6, 0, z] as [number, number, number]
      });
    }
    
    return items;
  }, []);
  
  return (
    <group>
      {/* Apartment Floor */}
      <mesh position={[0, -0.1, playerZ]} receiveShadow>
        <planeGeometry args={[16, 200]} />
        <meshLambertMaterial map={floorTexture} />
      </mesh>
      
      {/* Apartment Carpet Lines (play zones) */}
      {[-3, 3].map((x, i) => (
        <mesh key={`carpet_${i}`} position={[x, -0.05, playerZ]} receiveShadow>
          <planeGeometry args={[2, 200]} />
          <meshLambertMaterial map={carpetTexture} color="#8B4513" />
        </mesh>
      ))}
      
      {/* Apartment Furniture */}
      {furniture.map((item: any) => (
        <mesh
          key={item.id}
          position={item.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={item.size} />
          <meshLambertMaterial color={item.color} />
        </mesh>
      ))}
      
      {/* Apartment Items */}
      {apartmentItems.map(item => (
        <group key={item.id} position={item.position}>
          {item.type === 'toy_car' && (
            <>
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[1, 0.4, 0.6]} />
                <meshLambertMaterial color="#FF4757" />
              </mesh>
              {/* Car wheels */}
              {[[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.1, pos[1]]} castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.2]} />
                  <meshLambertMaterial color="#333333" />
                </mesh>
              ))}
            </>
          )}
          
          {item.type === 'pillow' && (
            <>
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[1.2, 0.4, 1.2]} />
                <meshLambertMaterial color="#FFB6C1" />
              </mesh>
            </>
          )}
          
          {item.type === 'lamp' && (
            <>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 2]} />
                <meshLambertMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 2.2, 0]} castShadow>
                <coneGeometry args={[0.6, 0.8, 8]} />
                <meshLambertMaterial color="#F5F5DC" />
              </mesh>
            </>
          )}
          
          {item.type === 'plant' && (
            <>
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.6]} />
                <meshLambertMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 1, 0]} castShadow>
                <sphereGeometry args={[0.5]} />
                <meshLambertMaterial color="#228B22" />
              </mesh>
            </>
          )}
        </group>
      ))}
      
      {/* Apartment Ceiling */}
      <mesh position={[0, 15, playerZ]}>
        <planeGeometry args={[30, 200]} />
        <meshBasicMaterial color="#F5F5DC" />
      </mesh>
    </group>
  );
}
