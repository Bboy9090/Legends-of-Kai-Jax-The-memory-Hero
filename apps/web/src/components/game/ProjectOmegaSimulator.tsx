import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Shield, Zap, Anchor, Activity, Target, Layers, AlertCircle, Sparkles, MessageSquare, Terminal, ChevronRight, HardHat } from 'lucide-react';

/**
 * PROJECT OMEGA: THE BEAST LINEAGE (v4.0)
 * --------------------------------------
 * Physics: g=18.0 (Personal Gravity)
 * Archetype: LP9 Reflector
 * Engine: React + Three.js + Gemini 2.5 Flash
 * Manifested by: The Lead Systems Architect
 * 
 * ULTIMATE FUSION STATUS: KAI-JAX IS THE FINAL FUSION - CANNOT FUSE FURTHER
 */

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || ""; // API Key from environment

const callGemini = async (prompt: string, systemInstruction: string) => {
  if (!apiKey) {
    console.warn("[ProjectOmega] Gemini API key not configured");
    return "AI features require API key configuration.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000): Promise<any> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw err;
    }
  };

  try {
    const result = await fetchWithRetry();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
  } catch (error) {
    console.error("[ProjectOmega] Gemini API error:", error);
    return "AI service unavailable.";
  }
};

interface BeastSimulatorProps {
  activeChar: 'jaxon' | 'kaison' | 'kai-jax';
  isSlamming: boolean;
  onImpact: (force: number) => void;
}

// --- THREE.JS SIMULATION COMPONENT ---
const BeastSimulator: React.FC<BeastSimulatorProps> = ({ activeChar, isSlamming, onImpact }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const tailsRef = useRef<THREE.Group[]>([]);
  const velocityY = useRef(0);
  const isJumping = useRef(false);
  const gravity = -18.0 / 60; // 18.0g scaled for frame rate

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.Fog(0x020202, 5, 25);

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting (High-contrast Bronx Grit)
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const spot = new THREE.SpotLight(0xffffff, 2);
    spot.position.set(5, 15, 5);
    spot.castShadow = true;
    scene.add(spot);
    const rim = new THREE.PointLight(0x3b82f6, 1.2, 10);
    rim.position.set(-5, 2, 2);
    scene.add(rim);

    // Environment
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    scene.add(new THREE.GridHelper(100, 100, 0x111111, 0x050505));

    // Beast Construction
    const createBeast = (id: 'jaxon' | 'kaison' | 'kai-jax') => {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x030303 });
      
      // Torso (Heavy Frame)
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 0.8, 4, 12), mat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      group.add(torso);

      // Predator Head
      const head = new THREE.Group();
      head.position.y = 1.6;
      head.add(new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), mat));
      
      const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.6, 12), mat);
      snout.rotation.x = Math.PI / 2.1;
      snout.position.set(0, -0.05, 0.45);
      head.add(snout);

      const earSize = (id === 'kaison' || id === 'kai-jax') ? 0.6 : 0.45;
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, earSize, 4), mat);
      earL.position.set(-0.25, 0.4, 0); earL.rotation.z = 0.3;
      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, earSize, 4), mat);
      earR.position.set(0.25, 0.4, 0); earR.rotation.z = -0.3;
      head.add(earL, earR);

      const eyeMat = new THREE.MeshBasicMaterial({ color: id === 'kai-jax' ? 0xffd700 : 0xfbbf24 });
      const eL = new THREE.Mesh(new THREE.SphereGeometry(0.05), eyeMat);
      eL.position.set(-0.16, 0.05, 0.38);
      const eR = new THREE.Mesh(new THREE.SphereGeometry(0.05), eyeMat);
      eR.position.set(0.16, 0.05, 0.38);
      head.add(eL, eR);
      group.add(head);

      // Beast Legs
      for(let i=0; i<4; i++) {
        const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.6, 4, 8), mat);
        if (i < 2) limb.position.set(i===0?-0.48:0.48, 0.5, 0.35);
        else limb.position.set(i===2?-0.48:0.48, 0.4, -0.4);
        group.add(limb);
      }

      // Sinuous Liquid Tails
      // Jaxon: 1 tail (white), Kaison: 2 tails (blue), Kai-Jax: 3 tails (red, blue, white - THE ULTIMATE FUSION)
      const colors = id === 'jaxon' 
        ? [0xffffff] 
        : id === 'kaison' 
        ? [0x2563eb, 0x2563eb] 
        : [0xdc2626, 0x2563eb, 0xffffff]; // Kai-Jax: 3 tails representing the ultimate fusion
      
      const tails: THREE.Group[] = [];
      colors.forEach((color, i) => {
        const tGroup = new THREE.Group();
        for(let j=0; j<12; j++) {
          const seg = new THREE.Mesh(
            new THREE.SphereGeometry(0.2 - (j * 0.015), 8, 8),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, transparent: true, opacity: 0.8 })
          );
          seg.position.y = j * 0.22;
          tGroup.add(seg);
        }
        tGroup.position.set((i - (colors.length-1)/2) * 0.6, 0.85, -0.6);
        tGroup.rotation.x = Math.PI * 0.75;
        group.add(tGroup);
        tails.push(tGroup);
      });
      return { group, tails };
    };

    const beast = createBeast(activeChar);
    characterRef.current = beast.group;
    tailsRef.current = beast.tails;
    scene.add(characterRef.current);

    let animationFrameId: number;
    const animate = () => {
      const time = performance.now() * 0.001;
      animationFrameId = requestAnimationFrame(animate);

      if (isJumping.current) {
        velocityY.current += gravity;
        if (characterRef.current) {
          characterRef.current.position.y += velocityY.current;
          if (characterRef.current.position.y <= 0) {
            const force = Math.abs(velocityY.current) * 200;
            characterRef.current.position.y = 0;
            isJumping.current = false;
            velocityY.current = 0;
            onImpact(force);
          }
        }
      } else {
        if (characterRef.current) {
          characterRef.current.position.y = Math.sin(time * 2.5) * 0.04;
          if (characterRef.current.children[1]) {
            characterRef.current.children[1].rotation.x = Math.sin(time) * 0.05;
          }
        }
      }

      tailsRef.current.forEach((t, i) => {
        t.children.forEach((seg, j) => {
          seg.position.x = Math.sin(time * 6 + i + j * 0.4) * (j * 0.04);
          seg.position.z = Math.cos(time * 5 + i + j * 0.4) * (j * 0.04);
        });
        t.rotation.z = Math.sin(time * 2 + i) * 0.12;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeChar, onImpact]);

  useEffect(() => {
    if (isSlamming && !isJumping.current) {
      isJumping.current = true;
      velocityY.current = 0.85;
    }
  }, [isSlamming]);

  return <div ref={mountRef} className="w-full h-full" />;
};

// --- MAIN INTERFACE ---
const ProjectOmegaSimulator: React.FC = () => {
  const [activeChar, setActiveChar] = useState<'jaxon' | 'kaison' | 'kai-jax'>('kai-jax');
  const [isSlamming, setIsSlamming] = useState(false);
  const [lastImpact, setLastImpact] = useState(0);
  const [sync, setSync] = useState(96.4);
  const [empathy, setEmpathy] = useState(82);

  // ✨ Gemini States
  const [lore, setLore] = useState("");
  const [counsel, setCounsel] = useState("");
  const [loading, setLoading] = useState(false);

  const charData = {
    jaxon: { 
      name: 'JAXON', 
      type: 'Lupine Brute', 
      dna: 'White Anchor Ink', 
      bio: 'The weight of the Bronx concrete held in a single lupine frame. Solo playable before fusion.' 
    },
    kaison: { 
      name: 'KAISON', 
      type: 'Tactical Kitsune', 
      dna: 'Triple Blue Ink', 
      bio: 'Frame-data specialist. Phasing through the simulation with precision. Solo playable before fusion.' 
    },
    'kai-jax': { 
      name: 'KAI-JAX', 
      type: 'Pinnacle Reflector', 
      dna: 'Tri-Spectrum Memory', 
      bio: 'THE ULTIMATE FUSION. GODS WILL TREMBLE. Convergence of past and future. The ultimate LP9 manifestation. Cannot fuse further.' 
    }
  };

  const handleImpact = (force: number) => {
    setLastImpact(force);
    setIsSlamming(false);
    setEmpathy(prev => Math.min(100, prev + 2));
  };

  const generateAI = async (mode: 'lore' | 'counsel') => {
    setLoading(true);
    const system = mode === 'lore' 
      ? "You are the Sage-Mode Manifestation Intelligence. Speak with a heavy, grounded, Bronx-grit tone. Cinematic, tactical, using Project Omega lore (LP9, 18.0g, star-slime). KAI-JAX IS THE ULTIMATE FUSION - cannot fuse further. Gods will tremble."
      : "You are a Tactical Strategist for an LP9 Reflector. Provide sharp, one-liner tactical advice based on current simulation metrics. No fluff, just facts.";
    
    const prompt = mode === 'lore'
      ? `Manifest a 2-sentence lore fragment for ${charData[activeChar].name} at ${empathy}% empathy. ${activeChar === 'kai-jax' ? 'Remember: KAI-JAX is THE ULTIMATE FUSION - the apex, the final form, gods will tremble.' : ''}`
      : `Current Entity: ${charData[activeChar].name}. Impact: ${lastImpact.toFixed(1)}kN. Sync: ${sync}%. Provide Sage Counsel.`;

    try {
      const res = await callGemini(prompt, system);
      if (mode === 'lore') setLore(res); else setCounsel(res);
    } catch (e) {
      console.error("[ProjectOmega] AI generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono uppercase overflow-hidden selection:bg-amber-500">
      
      {/* HUD HEADER */}
      <div className="p-6 flex justify-between items-start border-b border-white/10 bg-neutral-900/80 backdrop-blur-xl z-20">
        <div className="border-l-4 border-amber-500 pl-4">
          <h1 className="text-3xl font-black italic tracking-tighter leading-none">PROJECT_OMEGA_v4</h1>
          <p className="text-[10px] text-neutral-500 tracking-[0.4em] mt-2">REFLECTOR_SYNC // 18.0G // BEAST_LINEAGE</p>
          {activeChar === 'kai-jax' && (
            <p className="text-[10px] text-amber-500 tracking-[0.2em] mt-1 font-bold">THE ULTIMATE FUSION - GODS WILL TREMBLE</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['jaxon', 'kaison', 'kai-jax'] as const).map(id => (
            <button
              key={id}
              onClick={() => { setActiveChar(id); setLore(""); setCounsel(""); }}
              className={`px-6 py-2 text-[10px] font-black border transition-all ${
                activeChar === id ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-white/10 text-neutral-500 hover:border-white/30'
              } ${id === 'kai-jax' ? 'relative' : ''}`}
            >
              {id.toUpperCase()}
              {id === 'kai-jax' && (
                <span className="absolute -top-1 -right-1 text-[8px] text-amber-500">⚡</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CORE SIMULATION */}
      <div className="flex-1 relative">
        <BeastSimulator activeChar={activeChar} isSlamming={isSlamming} onImpact={handleImpact} />
        
        {/* OVERLAY UI */}
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-black/70 p-5 border border-white/10 backdrop-blur-md w-80 space-y-4">
              <div>
                <p className="text-[10px] text-neutral-500">ENTITY_DATA</p>
                <p className="text-2xl font-black italic">{charData[activeChar].name}</p>
                <p className="text-[9px] text-amber-500 font-bold">{charData[activeChar].type}</p>
                {activeChar === 'kai-jax' && (
                  <p className="text-[8px] text-red-500 font-black mt-1">THE ULTIMATE FUSION</p>
                )}
              </div>
              <p className="text-[10px] normal-case text-neutral-400 leading-tight border-l border-white/20 pl-3">{charData[activeChar].bio}</p>
              
              {/* ✨ Gemini Lore */}
              <div className="pt-4 pointer-events-auto border-t border-white/5">
                <button onClick={() => generateAI('lore')} disabled={loading} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-2 text-[9px] flex items-center justify-center gap-2">
                  <Sparkles size={12} className="text-amber-500" />
                  {loading ? "PROCESSING..." : "MANIFEST LORE"}
                </button>
                {lore && <p className="mt-3 text-[10px] normal-case italic text-neutral-400 leading-relaxed bg-black/40 p-2 border-l-2 border-amber-500">"{lore}"</p>}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="bg-black/70 p-4 border border-white/10 backdrop-blur-md text-right w-40">
                <p className="text-[10px] text-neutral-500">GRAV_SCALE</p>
                <p className="text-2xl font-black text-amber-500">18.0G</p>
              </div>
              <div className="bg-black/70 p-4 border border-white/10 backdrop-blur-md text-right w-40">
                <p className="text-[10px] text-neutral-500">IMPACT_FORCE</p>
                <p className="text-2xl font-black">{lastImpact.toFixed(1)}<span className="text-xs ml-1 text-neutral-500 font-normal">kN</span></p>
              </div>
              
              {/* ✨ Gemini Counsel */}
              <div className="pointer-events-auto flex flex-col items-end gap-2 w-72">
                <button onClick={() => generateAI('counsel')} disabled={loading} className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 p-2 text-[9px] text-amber-500 flex items-center gap-2">
                  <MessageSquare size={12} />
                  {loading ? "SYNCING..." : "SAGE COUNSEL"}
                </button>
                {counsel && <div className="bg-amber-900/20 border border-amber-500/20 p-3 text-right text-[10px] font-bold text-amber-100 italic">"{counsel}"</div>}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setIsSlamming(true)} 
              className="pointer-events-auto bg-white text-black font-black px-20 py-5 tracking-[0.5em] text-sm hover:bg-amber-500 transition-all active:scale-90 shadow-[0_0_50px_rgba(255,255,255,0.15)]"
            >
              EXECUTE_GRAVITY_SLAM
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER DATA */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-neutral-900 border-t border-white/10 z-20">
        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] text-neutral-500">
            <span className="flex items-center gap-2"><Activity size={12}/> REFLECTOR_SYNC</span>
            <span className="text-white font-black">{sync}%</span>
          </div>
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${sync}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] text-neutral-500">
            <span className="flex items-center gap-2"><Zap size={12}/> EMPATHY_RESONANCE</span>
            <span className="text-amber-500 font-black">{empathy}%</span>
          </div>
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${empathy}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-6">
          <div className="text-right">
            <p className="text-[9px] text-neutral-500 uppercase italic flex items-center gap-2 justify-end">
              <Terminal size={10} /> SYSTEM_STATUS: READY
            </p>
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Simulation Optimal</p>
            {activeChar === 'kai-jax' && (
              <p className="text-[8px] text-amber-500 font-black tracking-wider mt-1">ULTIMATE FUSION ACTIVE</p>
            )}
          </div>
          <Anchor className="text-neutral-700" size={24} />
        </div>
      </div>
    </div>
  );
};

export default ProjectOmegaSimulator;
