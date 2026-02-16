import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import "@/App.css";
import axios from "axios";
import { Zap, Flame, Wind, Shield, Droplet, Leaf, Sun, Star, Skull, Menu, X, ChevronRight, Loader2, Gamepad2 } from "lucide-react";

// Lazy load the Game component
const GamePage = lazy(() => import("./game/GamePage"));

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Particle Background Component
const ParticleBackground = () => {
  return (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            backgroundColor: ['#FF3B30', '#FFD60A', '#64D2FF', '#BF5AF2', '#2E2EFE'][Math.floor(Math.random() * 5)],
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sections = ['home', 'characters', 'tails', 'story', 'gods', 'regions', 'bible', 'ui'];

  return (
    <nav className="glass-nav" data-testid="main-navigation">
      <div className="container-game py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading text-lg tracking-tight">KAI-JAX</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`uppercase tracking-widest text-sm transition-colors ${
                activeSection === section ? 'text-primary' : 'text-white/60 hover:text-white'
              }`}
              data-testid={`nav-${section}`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="mobile-menu-toggle"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/5">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => { setActiveSection(section); setIsOpen(false); }}
              className={`block w-full text-left px-6 py-4 uppercase tracking-widest text-sm border-b border-white/5 ${
                activeSection === section ? 'text-primary bg-primary/10' : 'text-white/60'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = ({ onNavigate }) => {
  return (
    <section className="min-h-screen flex items-center justify-center hero-gradient relative" data-testid="hero-section">
      {/* Background with Kai-Jax art */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png"
          alt="Kai-Jax"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto object-contain opacity-30 md:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>
      
      <div className="container-game relative z-10 pt-20">
        <div className="max-w-3xl animate-fade-in-up">
          <p className="font-lore text-storm text-sm md:text-base tracking-[0.3em] mb-4">
            FORGED IN THE RAGING CITY
          </p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-none">
            LEGENDS OF <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fire via-electric to-storm">
              KAI-JAX
            </span>
          </h1>
          <p className="font-heading text-2xl md:text-3xl text-primary mb-8">
            THE MEMORY KING
          </p>
          <p className="font-lore text-white/60 text-lg md:text-xl max-w-xl mb-12">
            "Survival without memory is extinction with better design."
          </p>
          
          <div className="flex flex-wrap gap-4">
            {/* PLAY GAME - Primary CTA */}
            <Link 
              to="/game"
              className="btn-cyber flex items-center gap-2 bg-primary/20 border-primary hover:bg-primary/40 text-lg px-8 py-4"
              data-testid="cta-play-game"
            >
              <Gamepad2 className="w-5 h-5 text-primary" /> PLAY GAME
            </Link>
            <button 
              onClick={() => onNavigate('characters')} 
              className="btn-cyber flex items-center gap-2"
              data-testid="cta-characters"
            >
              <Star className="w-4 h-4" /> Meet the Heroes
            </button>
            <button 
              onClick={() => onNavigate('story')} 
              className="btn-cyber flex items-center gap-2 border-fire/50 hover:border-fire"
              data-testid="cta-story"
            >
              <Flame className="w-4 h-4 text-fire" /> Read the Saga
            </button>
            <button 
              onClick={() => onNavigate('tails')} 
              className="btn-cyber flex items-center gap-2 border-electric/50 hover:border-electric"
              data-testid="cta-tails"
            >
              <Zap className="w-4 h-4 text-electric" /> 9 Tails
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Character Card Component
const CharacterCard = ({ character, onGenerateImage, isGenerating }) => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  // Reference images from user's art - LOCKED IMAGE CANON
  const referenceImages = {
    kai: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    jax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    kaijax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png",
    boryn: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png",
    borax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png"
  };

  const handleGenerate = async () => {
    const prompts = {
      kai: "Anthropomorphic hedgehog-fox beast warrior, bipedal, fiery orange fur on top with blackish-grey bottom, spiky wild hair, athletic muscular build, wearing a cool streetwear jacket, SHOOTING WEBS from hands, web graffiti tags on walls behind him, playful confident pose, hanging upside down from web hammock, electric sparks on webs, urban cyberpunk city alley background, game character art style, hyper detailed, dynamic action pose, 4K",
      jax: "Anthropomorphic silver-blue fox beast warrior, bipedal, sleek elegant fur with frost patterns, magnificent fluffy tail, cool calculating cyan glowing eyes, ice crystals and lightning crackling around him, calm strategic pose, wearing tactical gear, cyberpunk city rooftop background, game character art style, hyper detailed, cool color palette, 4K",
      kaijax: "KAI-JAX THE MEMORY KING - towering dark shadowy beast fusion warrior, bipedal, GLOWING YELLOW EYES piercing through darkness, dark fur shifting between orange and blue, NINE MAGNIFICENT ELEMENTAL TAILS swirling (fire red, lightning blue, ice cyan, void purple, earth brown, water blue, nature green, light white, memory gold), heavy battle-worn armor, sovereign powerful stance, reality warping energy around him, dark apocalyptic cyberpunk city background, ultimate boss character art, hyper detailed, cinematic epic lighting, 4K",
      boryn: "Massive protective tiger beast father figure, bipedal, warm orange fur with battle scars, kind amber eyes, broad shoulders, sitting protectively watching over, warm street alley background with graffiti, fatherly presence, urban fantasy style, game character art, hyper detailed, warm golden lighting, 4K",
      borax: "TOWERING armored lion warrior beast, bipedal MASSIVE frame, ancient battle-worn heavy armor with spikes, cold piercing eyes, watching from cyberpunk city rooftop at night, neon signs in background, absolute authority presence, the apex predator, mentor figure, dark intimidating silhouette, game boss character art, hyper detailed, dramatic noir lighting, 4K"
    };

    setIsLocalGenerating(true);
    const result = await onGenerateImage(character.id, prompts[character.id] || prompts.kaijax);
    if (result) {
      setGeneratedImage(result);
    }
    setIsLocalGenerating(false);
  };

  const displayImage = generatedImage || referenceImages[character.id];
  const showGenerating = isLocalGenerating;

  const borderColors = {
    kai: 'border-fire/30 hover:border-fire',
    jax: 'border-storm/30 hover:border-storm',
    kaijax: 'border-primary/30 hover:border-primary',
    boryn: 'border-electric/30 hover:border-electric',
    borax: 'border-void/30 hover:border-void'
  };

  return (
    <div 
      className={`card-beam p-6 ${borderColors[character.id] || ''}`}
      data-testid={`character-card-${character.id}`}
    >
      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-black/60 relative group">
        {displayImage ? (
          <>
            <img 
              src={generatedImage ? `data:image/png;base64,${generatedImage}` : displayImage} 
              alt={character.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: showGenerating ? 0.3 : 1 }}
            />
            {/* Generate/Regenerate overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showGenerating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-black/60`}>
              <button
                onClick={handleGenerate}
                disabled={showGenerating}
                className="btn-cyber text-xs px-4 py-2 flex items-center gap-2"
                data-testid={`generate-${character.id}`}
              >
                {showGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> {generatedImage ? 'Regenerate' : 'Generate AI Art'}</>
                )}
              </button>
            </div>
            {/* AI Generated badge */}
            {generatedImage && !showGenerating && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-primary/80 rounded text-xs font-bold text-black">
                AI GENERATED
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
            <Star className="w-16 h-16 mb-4 opacity-50" />
            <button
              onClick={handleGenerate}
              disabled={showGenerating}
              className="btn-cyber text-xs px-4 py-2"
              data-testid={`generate-${character.id}`}
            >
              {showGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Generating...</>
              ) : (
                'Generate AI Art'
              )}
            </button>
          </div>
        )}
      </div>
      <h3 className="font-heading text-2xl mb-1">{character.name}</h3>
      <p className="text-primary text-sm mb-3 font-lore">{character.title}</p>
      <p className="text-white/60 text-sm mb-4 leading-relaxed">{character.description}</p>
      <div className="flex flex-wrap gap-2">
        {character.abilities?.slice(0, 4).map((ability, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
            {ability}
          </span>
        ))}
      </div>
    </div>
  );
};

// Characters Section
const CharactersSection = ({ onGenerateImage, isGenerating }) => {
  const [characters, setCharacters] = useState([]);
  const [aiGallery, setAiGallery] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(`${API}/characters`);
        setCharacters(response.data);
      } catch (e) {
        console.error('Failed to fetch characters:', e);
      }
    };
    fetchCharacters();
  }, []);

  // Fetch AI Gallery images
  useEffect(() => {
    const fetchAiGallery = async () => {
      try {
        const response = await axios.get(`${API}/ai-gallery`);
        setAiGallery(response.data);
      } catch (e) {
        console.error('Failed to fetch AI gallery:', e);
      }
    };
    fetchAiGallery();
  }, []);

  const characterNames = {
    kai: 'KAI - Prime Hero',
    jax: 'JAX - Prime Striker',
    kaijax: 'KAI-JAX - The Memory King',
    boryn: 'BORYN - The Shield Father',
    borax: 'BORAX - The Sabertooth Law'
  };

  // All reference art gallery - LOCKED IMAGE CANON
  const galleryImages = [
    {
      id: 'full-cast',
      title: 'LOCKED IMAGE CANON - Full Cast',
      description: 'Kai (fire) + Jax (ice) vs Borax (Tank King) + Boryn (Hunter General). Production canon locked.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qfhn7od0_F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png'
    },
    {
      id: 'brothers-training',
      title: 'The Brothers Training',
      description: 'Kai and Jax sparring in their youth, before the fall.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/wqaylhx5_IMG_2571.png'
    },
    {
      id: 'kaijax-dark',
      title: 'Kai-Jax: Shadow Form',
      description: 'The dark fusion with glowing yellow eyes and elemental tails in Sector-7.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/xtev4z4g_IMG_2562.png'
    },
    {
      id: 'kaijax-protector',
      title: 'Kai-Jax: The Protector',
      description: 'Defending the innocent with fire and web tails blazing.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/jedvy626_IMG_2623.png'
    },
    {
      id: 'kaijax-king',
      title: 'Kai-Jax: The Memory King',
      description: 'Full 9-tail armored form - the ultimate fusion state.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png'
    },
    {
      id: 'brothers-fusion',
      title: 'Brothers & Fusion',
      description: 'Kai (red jacket), Jax (blue jacket), and their legendary fusion form.',
      url: 'https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qg2yruaf_D3D596A4-184F-4AE1-8009-15784FB7D51F.png'
    }
  ];

  return (
    <section className="min-h-screen py-24" data-testid="characters-section">
      <div className="container-game">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="font-lore text-void text-sm tracking-[0.3em] mb-4">THE WARRIORS</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            MEET THE <span className="text-primary">LEGENDS</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Two brothers. One destiny. A fusion that cannot be erased.
          </p>
        </div>

        {/* Main Characters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {characters.map((char) => (
            <CharacterCard 
              key={char.id} 
              character={char} 
              onGenerateImage={onGenerateImage}
              isGenerating={isGenerating}
            />
          ))}
        </div>

        {/* Art Gallery Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <p className="font-lore text-fire text-sm tracking-[0.3em] mb-4">THE GALLERY</p>
            <h3 className="font-heading text-3xl md:text-4xl font-black mb-4">
              CHARACTER <span className="text-fire">ART</span>
            </h3>
            <p className="text-white/60">Concept art and character variations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {galleryImages.map((img, index) => (
              <div 
                key={img.id}
                className="card-beam overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`gallery-${img.id}`}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60" />
                </div>
                <div className="p-4">
                  <h4 className="font-heading text-lg text-primary mb-1">{img.title}</h4>
                  <p className="text-white/50 text-sm">{img.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Generated Gallery Section */}
        {aiGallery.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <p className="font-lore text-electric text-sm tracking-[0.3em] mb-4">AI GENERATED</p>
              <h3 className="font-heading text-3xl md:text-4xl font-black mb-4">
                <span className="text-electric">AI</span> CHARACTER GALLERY
              </h3>
              <p className="text-white/60">Unique character art generated by OpenAI GPT Image 1</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiGallery.map((img, index) => (
                <div 
                  key={`ai-${img.character_type}-${index}`}
                  className="card-beam overflow-hidden group border-electric/30 hover:border-electric"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`ai-gallery-${img.character_type}`}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={`data:image/png;base64,${img.image_base64}`}
                      alt={characterNames[img.character_type] || img.character_type}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-electric/80 rounded text-xs font-bold text-black">
                      AI GENERATED
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading text-lg text-electric mb-1">
                      {characterNames[img.character_type] || img.character_type.toUpperCase()}
                    </h4>
                    <p className="text-white/40 text-xs line-clamp-2">{img.prompt?.slice(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Tail Card Component
const TailCard = ({ tail, index }) => {
  const icons = {
    Fire: Flame,
    Wind: Wind,
    Shadow: Skull,
    Lightning: Zap,
    Earth: Shield,
    Water: Droplet,
    Nature: Leaf,
    Light: Sun,
    'Memory/Reality': Star
  };
  
  const Icon = icons[tail.element] || Star;

  return (
    <div 
      className="card-beam p-6 group"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        borderColor: `${tail.color}20`
      }}
      data-testid={`tail-card-${tail.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${tail.color}20`, boxShadow: `0 0 20px ${tail.color}40` }}
        >
          <Icon className="w-6 h-6" style={{ color: tail.color }} />
        </div>
        <span className="text-4xl font-heading font-black text-white/10">
          {tail.id.toString().padStart(2, '0')}
        </span>
      </div>
      
      <h3 className="font-heading text-xl mb-1" style={{ color: tail.color }}>
        {tail.name}
      </h3>
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
        {tail.element} • {tail.primary_use}
      </p>
      <p className="text-white/60 text-sm mb-4">
        {tail.description}
      </p>
      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Signature Move</p>
        <p className="font-heading text-sm" style={{ color: tail.color }}>
          {tail.signature_move}
        </p>
      </div>
    </div>
  );
};

// Tails Section
const TailsSection = () => {
  const [tails, setTails] = useState([]);

  useEffect(() => {
    const fetchTails = async () => {
      try {
        const response = await axios.get(`${API}/tails`);
        setTails(response.data);
      } catch (e) {
        console.error('Failed to fetch tails:', e);
      }
    };
    fetchTails();
  }, []);

  return (
    <section className="min-h-screen py-24 bg-black/30" data-testid="tails-section">
      <div className="container-game">
        <div className="text-center mb-16">
          <p className="font-lore text-electric text-sm tracking-[0.3em] mb-4">THE NINE-TAIL SYSTEM</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            <span className="text-fire">NINE</span> TAILS OF <span className="text-primary">POWER</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Kai-Jax always has nine tails. The world only allows him to express some.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tails.map((tail, index) => (
            <TailCard key={tail.id} tail={tail} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="card-beam p-8 max-w-2xl mx-auto">
            <p className="font-lore text-lg text-primary mb-4">The Ninth Tail</p>
            <p className="text-white/60 italic">
              "Not power. Not spectacle. It appears only when internal conflict ends. 
              It settles. The world stops correcting him."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Story Act Card
const StoryActCard = ({ act }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actColors = {
    1: 'border-fire',
    2: 'border-storm',
    3: 'border-void',
    4: 'border-electric',
    5: 'border-primary'
  };

  return (
    <div 
      className={`card-beam overflow-hidden ${actColors[act.act_number] || 'border-white/10'}`}
      data-testid={`story-act-${act.act_number}`}
    >
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
              Act {act.act_number}
            </p>
            <h3 className="font-heading text-2xl mb-1">{act.title}</h3>
            <p className="font-lore text-primary/80 text-sm italic">{act.subtitle}</p>
          </div>
          <ChevronRight 
            className={`w-6 h-6 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
        <p className="text-white/40 text-sm mt-3">
          Region: <span className="text-white/60">{act.region}</span>
        </p>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-white/5 pt-4 animate-fade-in-up">
          <p className="text-white/60 text-sm mb-4 leading-relaxed">
            {act.narrative}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Gameplay Goals</p>
              <ul className="text-sm text-white/60 space-y-1">
                {act.gameplay_goals?.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span> {goal}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Systems Introduced</p>
              <ul className="text-sm text-white/60 space-y-1">
                {act.systems_introduced?.map((sys, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-storm">•</span> {sys}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 mt-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Boss Philosophy Test</p>
            <p className="text-sm text-fire">{act.boss_test}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="font-lore text-center text-primary/80 italic">
              "{act.player_learns}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Story Section
const StorySection = () => {
  const [storyActs, setStoryActs] = useState([]);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`${API}/story`);
        setStoryActs(response.data);
      } catch (e) {
        console.error('Failed to fetch story:', e);
      }
    };
    fetchStory();
  }, []);

  return (
    <section className="min-h-screen py-24" data-testid="story-section">
      <div className="container-game">
        <div className="text-center mb-16">
          <p className="font-lore text-fire text-sm tracking-[0.3em] mb-4">THE SAGA</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            FIVE ACTS OF <span className="text-fire">DESTINY</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From survival to sovereignty. From grief to glory.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {storyActs.map((act) => (
            <StoryActCard key={act.act_number} act={act} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="card-beam p-8 max-w-2xl mx-auto bg-gradient-to-b from-primary/5 to-transparent">
            <p className="font-lore text-xl text-primary mb-4">The Coronation</p>
            <p className="text-white/60 mb-4">
              When alignment is complete, the Ninth Tail manifests. 
              Boryn's Spiritual Echo appears. He acknowledges and crowns Kai-Jax.
            </p>
            <p className="font-lore text-2xl text-electric italic">
              "You carried what I couldn't."
            </p>
            <p className="text-sm text-white/40 mt-4">
              Memory Hero → Memory King. A state change, not a buff.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Gods Section
const GodsSection = () => {
  const [gods, setGods] = useState([]);

  useEffect(() => {
    const fetchGods = async () => {
      try {
        const response = await axios.get(`${API}/gods`);
        setGods(response.data);
      } catch (e) {
        console.error('Failed to fetch gods:', e);
      }
    };
    fetchGods();
  }, []);

  const godImages = {
    'Kar-Voth': 'https://images.unsplash.com/photo-1767188789856-33aad26e784f?w=800&q=80',
    'Thryxen': 'https://images.unsplash.com/photo-1752079914941-ba39bbed123b?w=800&q=80',
    'Pyraxis': 'https://images.unsplash.com/photo-1644261766628-3af7203be678?w=800&q=80',
    'Myrr\'Kai': 'https://images.unsplash.com/photo-1737768437560-9d523fa3adc0?w=800&q=80'
  };

  return (
    <section className="min-h-screen py-24 bg-black/30" data-testid="gods-section">
      <div className="container-game">
        <div className="text-center mb-16">
          <p className="font-lore text-void text-sm tracking-[0.3em] mb-4">THE MYTHOLOGY</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            THE FOUR <span className="text-void">SABERTOOTH GODS</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto font-lore italic">
            "They did not rule the world. They taught it how to survive without them."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {gods.map((god) => (
            <div 
              key={god.name}
              className="card-beam overflow-hidden group"
              style={{ borderColor: `${god.color}30` }}
              data-testid={`god-card-${god.name}`}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={godImages[god.name]} 
                  alt={god.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-lore text-2xl" style={{ color: god.color }}>
                    {god.name}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  {god.domain} • {god.element}
                </p>
                <p className="text-white/60 text-sm">
                  {god.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Regions Section
const RegionsSection = () => {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${API}/regions`);
        setRegions(response.data);
      } catch (e) {
        console.error('Failed to fetch regions:', e);
      }
    };
    fetchRegions();
  }, []);

  const dangerColors = {
    'Moderate': 'text-electric',
    'High': 'text-fire',
    'Extreme': 'text-void',
    'Variable': 'text-storm',
    'Lethal': 'text-fire'
  };

  return (
    <section className="min-h-screen py-24" data-testid="regions-section">
      <div className="container-game">
        <div className="text-center mb-16">
          <p className="font-lore text-storm text-sm tracking-[0.3em] mb-4">THE WORLD</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            FRACTURED <span className="text-storm">MEGACITY</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            A vertical megacity built on forgotten myth. One world. Many philosophies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region, index) => (
            <div 
              key={region.name}
              className="card-beam p-6"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`region-card-${index}`}
            >
              <h3 className="font-heading text-xl mb-2">{region.name}</h3>
              <p className={`text-xs uppercase tracking-widest mb-3 ${dangerColors[region.danger_level]}`}>
                Danger Level: {region.danger_level}
              </p>
              <p className="text-white/60 text-sm mb-4">
                {region.description}
              </p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Primary Threats</p>
                <div className="flex flex-wrap gap-2">
                  {region.primary_enemies?.map((enemy, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-fire/10 text-fire/80">
                      {enemy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="font-lore text-xl text-white/40 italic">
            "The city remembers how you played."
          </p>
        </div>
      </div>
    </section>
  );
};

// Duplicate BibleSection removed - using the comprehensive version below

// Bible Section - Complete Game Documentation
const BibleSection = () => {
  const [blueprint, setBlueprint] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        const response = await axios.get(`${API}/blueprint`);
        setBlueprint(response.data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch blueprint:', e);
        setLoading(false);
      }
    };
    fetchBlueprint();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen py-24 flex items-center justify-center">
        <div className="spinner" />
      </section>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📕' },
    { id: 'story', label: 'Story & Lore', icon: '📕' },
    { id: 'systems', label: 'Game Systems', icon: '📘' },
    { id: 'enemies', label: 'Enemies', icon: '📗' },
    { id: 'acts', label: 'Act Structure', icon: '📙' },
    { id: 'modes', label: 'Game Modes', icon: '📒' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="card-beam p-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
        <h3 className="font-heading text-3xl text-primary mb-2">{blueprint?.title}</h3>
        <p className="font-lore text-xl text-electric mb-6">{blueprint?.subtitle}</p>
        <p className="text-white/50 text-sm mb-4">Version: {blueprint?.version}</p>
        <div className="max-w-2xl mx-auto p-6 bg-black/40 rounded-xl">
          <p className="font-lore text-lg text-storm italic">
            "{blueprint?.franchise_spine}"
          </p>
        </div>
      </div>
      
      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-fire mb-4">Studio Handoff Structure</h4>
        <p className="text-primary font-bold mb-4">{blueprint?.studio_handoff?.status}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {blueprint?.studio_handoff?.deliverables?.map((item, i) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg text-center">
              <p className="text-white/80 text-sm font-bold">{item.bible}</p>
              <p className="text-white/40 text-xs">→ {item.team}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStoryLore = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center bg-gradient-to-r from-fire/10 to-transparent">
        <h4 className="font-heading text-2xl text-fire mb-2">📕 {blueprint?.story_lore_bible?.title}</h4>
        <p className="text-white/50">{blueprint?.story_lore_bible?.subtitle}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-primary mb-4">Core Thesis</h4>
        <p className="font-lore text-xl text-electric italic text-center">
          "{blueprint?.story_lore_bible?.core_thesis}"
        </p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-storm mb-4">The World</h4>
        <p className="text-white/70 mb-4">{blueprint?.story_lore_bible?.the_world?.description}</p>
        <ul className="space-y-2">
          {blueprint?.story_lore_bible?.the_world?.rules?.map((rule, i) => (
            <li key={i} className="text-white/50 text-sm flex items-center gap-2">
              <span className="text-storm">◆</span> {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-void mb-4">Mythology</h4>
        <p className="text-white/60 italic mb-4">{blueprint?.story_lore_bible?.mythology?.principle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {blueprint?.story_lore_bible?.mythology?.gods?.map((god, i) => (
            <div key={i} className="bg-black/40 p-4 rounded-lg text-center" style={{ borderLeft: `3px solid ${god.color}` }}>
              <p className="font-heading text-lg" style={{ color: god.color }}>{god.name}</p>
              <p className="text-white/50 text-xs">{god.domain}</p>
              <p className="text-white/30 text-xs">{god.element}</p>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm italic mt-4 text-center">{blueprint?.story_lore_bible?.mythology?.note}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-electric mb-4">{blueprint?.story_lore_bible?.two_father_doctrine?.title}</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 p-4 rounded-lg border-l-2 border-fire">
            <p className="font-heading text-lg text-fire mb-2">BORYN</p>
            <p className="text-white/50 text-sm mb-2">{blueprint?.story_lore_bible?.two_father_doctrine?.boryn?.title}</p>
            <ul className="space-y-1">
              {blueprint?.story_lore_bible?.two_father_doctrine?.boryn?.traits?.map((t, i) => (
                <li key={i} className="text-white/40 text-xs">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border-l-2 border-storm">
            <p className="font-heading text-lg text-storm mb-2">BORAX</p>
            <p className="text-white/50 text-sm mb-2">{blueprint?.story_lore_bible?.two_father_doctrine?.borax?.title}</p>
            <ul className="space-y-1">
              {blueprint?.story_lore_bible?.two_father_doctrine?.borax?.traits?.map((t, i) => (
                <li key={i} className="text-white/40 text-xs">• {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-primary italic">{blueprint?.story_lore_bible?.two_father_doctrine?.truth}</p>
      </div>
    </div>
  );

  const renderSystems = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center bg-gradient-to-r from-storm/10 to-transparent">
        <h4 className="font-heading text-2xl text-storm mb-2">📘 {blueprint?.game_systems_bible?.title}</h4>
        <p className="text-white/50">{blueprint?.game_systems_bible?.subtitle}</p>
      </div>

      <div className="card-beam p-6 text-center">
        <h4 className="font-heading text-xl text-primary mb-4">Core Gameplay Loop</h4>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {blueprint?.game_systems_bible?.core_loop?.split(' → ').map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-4 py-2 bg-primary/20 rounded-full text-primary font-bold">{step}</span>
              {i < arr.length - 1 && <span className="text-white/30">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-electric mb-4">{blueprint?.game_systems_bible?.nine_tail_system?.title}</h4>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Rules</p>
            <ul className="space-y-1">
              {blueprint?.game_systems_bible?.nine_tail_system?.rules?.map((r, i) => (
                <li key={i} className="text-white/60 text-sm">• {r}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Progression</p>
            <ul className="space-y-1">
              {blueprint?.game_systems_bible?.nine_tail_system?.progression?.map((p, i) => (
                <li key={i} className="text-white/60 text-sm">• {p}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">The Ninth Tail</p>
            <p className="text-primary text-sm mb-2">{blueprint?.game_systems_bible?.nine_tail_system?.ninth_tail?.truth}</p>
            <p className="text-electric italic text-sm">{blueprint?.game_systems_bible?.nine_tail_system?.ninth_tail?.moment}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {blueprint?.game_systems_bible?.nine_tail_system?.milestones?.map((m, i) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg text-center" style={{ borderTop: `2px solid ${i === 3 ? '#FFD60A' : i === 2 ? '#FF3B30' : i === 1 ? '#64D2FF' : '#BF5AF2'}` }}>
              <p className="text-2xl font-heading text-white/80">{m.tails}</p>
              <p className="text-xs text-white/50">{m.stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-void mb-4">Memory vs Design</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 p-4 rounded-lg border-l-2 border-primary">
            <p className="font-heading text-primary mb-2">MEMORY (Player)</p>
            <p className="text-xs text-white/40 mb-2">Rewards: {blueprint?.game_systems_bible?.memory_vs_design?.memory?.rewards?.join(', ')}</p>
            <ul className="space-y-1">
              {blueprint?.game_systems_bible?.memory_vs_design?.memory?.effects?.map((e, i) => (
                <li key={i} className="text-white/50 text-xs">✓ {e}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border-l-2 border-fire">
            <p className="font-heading text-fire mb-2">DESIGN (Enemy)</p>
            <ul className="space-y-1">
              {blueprint?.game_systems_bible?.memory_vs_design?.design?.behavior?.map((b, i) => (
                <li key={i} className="text-white/50 text-xs">✗ {b}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-storm italic text-sm">{blueprint?.game_systems_bible?.memory_vs_design?.truth}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-fire mb-4">Movement Philosophy</h4>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {blueprint?.game_systems_bible?.movement_philosophy?.principles?.map((p, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-fire/20 text-fire text-sm">{p}</span>
          ))}
        </div>
        <p className="text-center text-white/60 italic">"{blueprint?.game_systems_bible?.movement_philosophy?.feel}"</p>
      </div>
    </div>
  );

  const renderEnemies = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center bg-gradient-to-r from-void/10 to-transparent">
        <h4 className="font-heading text-2xl text-void mb-2">📗 {blueprint?.enemy_faction_bible?.title}</h4>
        <p className="text-white/50">{blueprint?.enemy_faction_bible?.subtitle}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-fire mb-4">The Void Fang Covenant</h4>
        <p className="text-white/60 mb-2">{blueprint?.enemy_faction_bible?.void_fang_covenant?.description}</p>
        <p className="text-fire italic mb-4">"{blueprint?.enemy_faction_bible?.void_fang_covenant?.belief}"</p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Goals</p>
            <ul className="space-y-1">
              {blueprint?.enemy_faction_bible?.void_fang_covenant?.goals?.map((g, i) => (
                <li key={i} className="text-white/60 text-sm">• {g}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Elite Commanders</p>
            {blueprint?.enemy_faction_bible?.void_fang_covenant?.elite_commanders?.map((c, i) => (
              <div key={i} className="mb-2">
                <p className="text-void text-sm font-bold">{c.name}</p>
                <p className="text-white/40 text-xs">{c.specialty}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-white/40 italic">{blueprint?.enemy_faction_bible?.void_fang_covenant?.note}</p>
      </div>

      <div className="card-beam p-6 bg-gradient-to-b from-fire/5 to-transparent">
        <h4 className="font-heading text-xl text-fire mb-2">{blueprint?.enemy_faction_bible?.ulgorr?.title}</h4>
        <p className="text-white/40 text-sm mb-4">{blueprint?.enemy_faction_bible?.ulgorr?.role}</p>
        
        <p className="text-white/60 mb-4">{blueprint?.enemy_faction_bible?.ulgorr?.description}</p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Traits</p>
            <ul className="space-y-1">
              {blueprint?.enemy_faction_bible?.ulgorr?.traits?.map((t, i) => (
                <li key={i} className="text-white/60 text-sm">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">His Plan</p>
            <ul className="space-y-1">
              {blueprint?.enemy_faction_bible?.ulgorr?.plan?.map((p, i) => (
                <li key={i} className="text-white/60 text-sm">• {p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-black/60 p-4 rounded-lg text-center">
          <p className="text-fire italic mb-2">"{blueprint?.enemy_faction_bible?.ulgorr?.belief}"</p>
          <p className="text-storm text-sm">{blueprint?.enemy_faction_bible?.ulgorr?.weakness}</p>
        </div>
      </div>
    </div>
  );

  const renderActs = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center bg-gradient-to-r from-electric/10 to-transparent">
        <h4 className="font-heading text-2xl text-electric mb-2">📙 {blueprint?.act_structure?.title}</h4>
        <p className="text-white/50">{blueprint?.act_structure?.subtitle}</p>
      </div>

      <div className="space-y-4">
        {blueprint?.act_structure?.acts?.map((act, i) => {
          const colors = ['#FF3B30', '#64D2FF', '#BF5AF2', '#FFD60A', '#2E2EFE'];
          return (
            <div key={i} className="card-beam p-6" style={{ borderLeft: `4px solid ${colors[i]}` }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white/40 text-xs uppercase">Act {act.number}</p>
                  <h4 className="font-heading text-xl" style={{ color: colors[i] }}>{act.title}</h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors[i]}20`, color: colors[i] }}>
                  {act.theme}
                </span>
              </div>
              <ul className="space-y-1">
                {act.events?.map((e, j) => (
                  <li key={j} className="text-white/60 text-sm">• {e}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="card-beam p-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
        <p className="font-lore text-lg text-primary italic">
          "{blueprint?.act_structure?.end_truth}"
        </p>
      </div>
    </div>
  );

  const renderModes = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center bg-gradient-to-r from-electric/10 to-transparent">
        <h4 className="font-heading text-2xl text-electric mb-2">📒 {blueprint?.mode_breakdown?.title}</h4>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {blueprint?.mode_breakdown?.modes?.map((mode, i) => {
          const colors = ['#2E2EFE', '#FF3B30', '#64D2FF'];
          return (
            <div key={i} className="card-beam p-6" style={{ borderTop: `3px solid ${colors[i]}` }}>
              <h4 className="font-heading text-xl mb-4" style={{ color: colors[i] }}>{mode.name}</h4>
              <ul className="space-y-2">
                {mode.features?.map((f, j) => (
                  <li key={j} className="text-white/60 text-sm flex items-center gap-2">
                    <span style={{ color: colors[i] }}>◆</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'story': return renderStoryLore();
      case 'systems': return renderSystems();
      case 'enemies': return renderEnemies();
      case 'acts': return renderActs();
      case 'modes': return renderModes();
      default: return renderOverview();
    }
  };

  return (
    <section className="min-h-screen py-24" data-testid="bible-section">
      <div className="container-game">
        <div className="text-center mb-12">
          <p className="font-lore text-primary text-sm tracking-[0.3em] mb-4">MASTER BLUEPRINT</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            GAME <span className="text-primary">BIBLE</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            The complete studio-grade documentation. Canon locked. AAA-ready.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
              data-testid={`bible-tab-${tab.id}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

// UI & Codex Section
const UISection = () => {
  const [charSelect, setCharSelect] = useState(null);
  const [matchups, setMatchups] = useState([]);
  const [codex, setCodex] = useState(null);
  const [activeTab, setActiveTab] = useState('select');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [selectRes, matchupRes, codexRes] = await Promise.all([
          axios.get(`${API}/ui/character-select`),
          axios.get(`${API}/ui/matchups`),
          axios.get(`${API}/ui/codex`)
        ]);
        setCharSelect(selectRes.data);
        setMatchups(matchupRes.data);
        setCodex(codexRes.data);
      } catch (e) {
        console.error('Failed to fetch UI data:', e);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'select', label: 'Character Select' },
    { id: 'matchups', label: 'Matchup Art' },
    { id: 'codex', label: 'Codex System' }
  ];

  const renderCharacterSelect = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center">
        <h4 className="font-heading text-xl text-primary mb-4">{charSelect?.title}</h4>
        <p className="text-white/60 italic">"{charSelect?.design_philosophy}"</p>
      </div>

      {/* Layout Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Left - Heroes */}
        <div className="card-beam p-4">
          <h5 className="font-heading text-lg text-storm mb-3">{charSelect?.layout?.left_column?.title}</h5>
          <div className="space-y-2">
            {charSelect?.layout?.left_column?.characters?.map((char, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded">
                <span className="text-white/80">{char.name}</span>
                <span className="text-xs text-storm">{char.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Preview */}
        <div className="card-beam p-4 text-center">
          <h5 className="font-heading text-lg text-primary mb-3">CENTER STAGE</h5>
          <div className="bg-black/60 p-6 rounded-lg mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Star className="w-10 h-10 text-primary" />
            </div>
            <p className="text-sm text-white/50">Large animated model</p>
          </div>
          <ul className="text-xs text-white/40 space-y-1">
            {charSelect?.layout?.center?.features?.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>

        {/* Right - Opposition */}
        <div className="card-beam p-4">
          <h5 className="font-heading text-lg text-fire mb-3">{charSelect?.layout?.right_column?.title}</h5>
          <div className="space-y-2">
            {charSelect?.layout?.right_column?.characters?.map((char, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded">
                <span className="text-white/80">{char.name}</span>
                <span className="text-xs text-fire">{char.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Behavior */}
      <div className="card-beam p-6">
        <h5 className="font-heading text-lg text-electric mb-4">Hover Behavior</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {charSelect?.hover_behavior?.examples?.map((ex, i) => (
            <div key={i} className="text-center p-3 bg-black/40 rounded-lg">
              <p className="text-white/60 text-sm">{ex.character}</p>
              <p className="font-heading text-electric text-lg">"{ex.word}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Rules */}
      <div className="card-beam p-6">
        <h5 className="font-heading text-lg text-void mb-4">Visual Rules</h5>
        <div className="flex flex-wrap gap-2">
          {charSelect?.visual_rules?.map((rule, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-void/20 text-void text-sm">{rule}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMatchups = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-white/50 text-sm">For: Versus splash screens, Story chapter cards, Marketing key art</p>
      </div>

      {matchups.map((matchup, i) => (
        <div key={i} className="card-beam p-6" style={{ borderLeft: `4px solid ${matchup.color}` }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{i === 0 ? '🦷' : i === 1 ? '🦁' : i === 2 ? '🐯' : '🌠'}</span>
            <div>
              <h4 className="font-heading text-xl" style={{ color: matchup.color }}>{matchup.title}</h4>
              <p className="text-white/50 text-sm italic">"{matchup.subtitle}"</p>
            </div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-xs text-white/40 uppercase mb-2">Art Prompt</p>
            <p className="text-white/70 text-sm leading-relaxed">{matchup.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCodex = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center">
        <h4 className="font-heading text-2xl text-primary mb-2">{codex?.title}</h4>
        <p className="text-white/60">{codex?.description}</p>
      </div>

      {/* Unlock Rules */}
      <div className="card-beam p-6">
        <h5 className="font-heading text-lg text-storm mb-4">How Entries Unlock</h5>
        <div className="flex flex-wrap gap-2 mb-3">
          {codex?.unlock_rules?.map((rule, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-storm/20 text-storm text-sm">{rule}</span>
          ))}
        </div>
        <p className="text-fire text-sm italic">{codex?.never}</p>
      </div>

      {/* Tab Structure */}
      <div className="card-beam p-6">
        <h5 className="font-heading text-lg text-electric mb-4">Entry Structure - 4 Tabs</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {codex?.structure?.tabs?.map((tab, i) => (
            <div key={i} className="bg-black/40 p-4 rounded-lg text-center" style={{ borderTop: `2px solid ${i === 0 ? '#64D2FF' : i === 1 ? '#30D158' : i === 2 ? '#FF3B30' : '#BF5AF2'}` }}>
              <p className="font-heading text-sm" style={{ color: i === 0 ? '#64D2FF' : i === 1 ? '#30D158' : i === 2 ? '#FF3B30' : '#BF5AF2' }}>{tab.name}</p>
              <p className="text-white/40 text-xs mt-1">{tab.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example Entries */}
      <div className="space-y-4">
        <h5 className="font-heading text-lg text-primary">Example Codex Entries</h5>
        {codex?.example_entries?.map((entry, i) => (
          <div key={i} className="card-beam p-4">
            <p className="font-heading text-lg text-electric mb-3">ENTRY: {entry.entry}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-black/40 p-2 rounded">
                <p className="text-storm text-xs uppercase mb-1">Known</p>
                <p className="text-white/60">{entry.known}</p>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <p className="text-[#30D158] text-xs uppercase mb-1">Remembered</p>
                <p className="text-white/60">{entry.remembered}</p>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <p className="text-fire text-xs uppercase mb-1">Lost</p>
                <p className="text-white/60">{entry.lost}</p>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <p className="text-void text-xs uppercase mb-1">Player Note</p>
                <p className="text-white/60 italic">"{entry.player_note}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tail Codex UI */}
      <div className="card-beam p-6">
        <h5 className="font-heading text-lg text-primary mb-4">Tail Codex UI</h5>
        <p className="text-white/60 mb-3">{codex?.tail_codex_ui?.display}</p>
        <ul className="space-y-1 mb-3">
          {codex?.tail_codex_ui?.rules?.map((rule, i) => (
            <li key={i} className="text-white/50 text-sm">• {rule}</li>
          ))}
        </ul>
        <p className="text-storm text-sm italic">{codex?.tail_codex_ui?.hover}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'matchups': return renderMatchups();
      case 'codex': return renderCodex();
      default: return renderCharacterSelect();
    }
  };

  return (
    <section className="min-h-screen py-24 bg-black/30" data-testid="ui-section">
      <div className="container-game">
        <div className="text-center mb-12">
          <p className="font-lore text-electric text-sm tracking-[0.3em] mb-4">GAME UI</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            UI & <span className="text-electric">CODEX</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Character select, matchup art prompts, and the Memory Ledger system.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-electric text-black' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
              data-testid={`ui-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="py-12 border-t border-white/5" data-testid="footer">
    <div className="container-game text-center">
      <div className="mb-6">
        <h3 className="font-heading text-2xl mb-2">
          LEGENDS OF <span className="text-primary">KAI-JAX</span>
        </h3>
        <p className="font-lore text-white/40 italic">
          "Forged in the Raging City. Crowned by Memory."
        </p>
      </div>
      <p className="text-white/30 text-sm">
        Built with Bronx-grit and 2/5 Reflector precision.
      </p>
      <p className="text-white/20 text-xs mt-4">
        Memory cannot be designed out of existence.
      </p>
    </div>
  </footer>
);

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (characterType, prompt) => {
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/generate-image`, {
        character_type: characterType,
        prompt: prompt
      });
      setIsGenerating(false);
      return response.data.image_base64;
    } catch (e) {
      console.error('Image generation failed:', e);
      setIsGenerating(false);
      return null;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'characters':
        return <CharactersSection onGenerateImage={handleGenerateImage} isGenerating={isGenerating} />;
      case 'tails':
        return <TailsSection />;
      case 'story':
        return <StorySection />;
      case 'gods':
        return <GodsSection />;
      case 'regions':
        return <RegionsSection />;
      case 'bible':
        return <BibleSection />;
      case 'ui':
        return <UISection />;
      default:
        return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main>
        {renderSection()}
      </main>

      <Footer />
    </div>
  );
}

// Loading fallback for game
const GameLoadingFallback = () => (
  <div className="w-full h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
      <p className="text-white/60">Loading game...</p>
    </div>
  </div>
);

// Main App with Router
function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/game" 
          element={
            <Suspense fallback={<GameLoadingFallback />}>
              <GamePage />
            </Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWrapper;
