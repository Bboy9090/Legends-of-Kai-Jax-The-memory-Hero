import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Environment } from "@react-three/drei";
import { useWorldState } from "../../../lib/stores/useWorldState";
import { useSquad } from "../../../lib/stores/useSquad";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Swords, Map, Zap, Users, Home } from "lucide-react";
import { useRunner } from "../../../lib/stores/useRunner";

// Nexus Haven - The player's hub world
export default function NexusHaven() {
  const { discoveredZones, nexusLevel, recruitedHeroes, voidKingWeakness } = useWorldState();
  const { squad } = useSquad();
  const { setGameState } = useRunner();

  return (
    <div className="min-h-screen w-full relative">
      {/* 3D World View */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <color attach="background" args={["#0a0e27"]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.0} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00BFFF" />
          
          {/* Environment */}
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="night" />
          
          {/* Nexus Haven Central Structure */}
          <group position={[0, 0, 0]}>
            {/* Main platform */}
            <mesh receiveShadow position={[0, -0.5, 0]}>
              <cylinderGeometry args={[8, 10, 1, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Central crystal */}
            <mesh position={[0, 2, 0]} castShadow>
              <octahedronGeometry args={[1.5, 0]} />
              <meshStandardMaterial 
                color="#00BFFF" 
                emissive="#00BFFF" 
                emissiveIntensity={0.5}
                metalness={1.0}
                roughness={0}
              />
            </mesh>
            
            {/* Energy pillars */}
            {[0, 90, 180, 270].map((angle, i) => {
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * 5;
              const z = Math.sin(radian) * 5;
              return (
                <mesh key={i} position={[x, 1, z]} castShadow>
                  <boxGeometry args={[0.5, 3, 0.5]} />
                  <meshStandardMaterial 
                    color={i % 2 === 0 ? "#DC143C" : "#1E90FF"}
                    emissive={i % 2 === 0 ? "#DC143C" : "#1E90FF"}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              );
            })}
          </group>
          
          <OrbitControls 
            enableZoom={true}
            minDistance={10}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full flex flex-col p-4 pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <Card className="bg-slate-900 bg-opacity-90 border-cyan-500 border-2">
              <CardHeader className="p-3">
                <CardTitle className="text-cyan-400 text-xl flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Nexus Haven - Level {nexusLevel}
                </CardTitle>
                <p className="text-white text-sm">Last Bastion of Hope</p>
              </CardHeader>
            </Card>
            
            <Card className="bg-red-900 bg-opacity-90 border-red-500 border-2">
              <CardContent className="p-3">
                <p className="text-red-200 text-sm font-bold">Void King Weakness</p>
                <p className="text-white text-2xl font-black">{voidKingWeakness}%</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Main actions */}
          <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => setGameState("character-select")}
              className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold py-6 flex flex-col items-center gap-2"
            >
              <Swords className="w-6 h-6" />
              <span>BATTLE</span>
            </Button>
            
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-6 flex flex-col items-center gap-2"
            >
              <Map className="w-6 h-6" />
              <span>EXPLORE</span>
              <span className="text-xs">{discoveredZones.length} zones</span>
            </Button>
            
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 flex flex-col items-center gap-2"
            >
              <Zap className="w-6 h-6" />
              <span>RIFTS</span>
              <span className="text-xs">Dimensional</span>
            </Button>
            
            <Button
              onClick={() => setGameState("squad-select")}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-6 flex flex-col items-center gap-2"
            >
              <Users className="w-6 h-6" />
              <span>SQUAD</span>
              <span className="text-xs">{recruitedHeroes.length} heroes</span>
            </Button>
          </div>
          
          {/* Current Squad Display */}
          <div className="mt-3">
            <Card className="bg-slate-900 bg-opacity-90 border-blue-500 border-2">
              <CardHeader className="p-3">
                <CardTitle className="text-blue-400 text-sm">Active Squad</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex gap-2">
                  {squad.map((heroId, i) => (
                    <div key={i} className="flex-1 bg-slate-800 p-2 rounded text-center">
                      <p className="text-white font-bold text-xs uppercase">{heroId}</p>
                      <p className="text-cyan-400 text-xs">Pos {i + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
