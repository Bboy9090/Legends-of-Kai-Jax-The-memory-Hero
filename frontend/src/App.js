import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Zap, Flame, Wind, Shield, Droplet, Leaf, Sun, Star, Skull, Menu, X, ChevronRight, Loader2 } from "lucide-react";

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
  const sections = ['home', 'characters', 'tails', 'story', 'gods', 'regions', 'bible'];

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

  // Reference images from user's art
  const referenceImages = {
    kai: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qg2yruaf_D3D596A4-184F-4AE1-8009-15784FB7D51F.png",
    jax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/qg2yruaf_D3D596A4-184F-4AE1-8009-15784FB7D51F.png",
    kaijax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/htuxfqte_9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png",
    boryn: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/wqaylhx5_IMG_2571.png",
    borax: "https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/wqaylhx5_IMG_2571.png"
  };

  const handleGenerate = async () => {
    const prompts = {
      kai: "Anthropomorphic hedgehog-fox beast warrior, bipedal, fiery orange fur on top with blackish-grey bottom, spiky wild hair, athletic muscular build, wearing a cool streetwear jacket, SHOOTING WEBS from hands, web graffiti tags on walls behind him, playful confident pose, hanging upside down from web hammock, electric sparks on webs, urban cyberpunk city alley background, game character art style, hyper detailed, dynamic action pose, 4K",
      jax: "Anthropomorphic silver-blue fox beast warrior, bipedal, sleek elegant fur with frost patterns, magnificent fluffy tail, cool calculating cyan glowing eyes, ice crystals and lightning crackling around him, calm strategic pose, wearing tactical gear, cyberpunk city rooftop background, game character art style, hyper detailed, cool color palette, 4K",
      kaijax: "KAI-JAX THE MEMORY KING - towering dark shadowy beast fusion warrior, bipedal, GLOWING YELLOW EYES piercing through darkness, dark fur shifting between orange and blue, NINE MAGNIFICENT ELEMENTAL TAILS swirling (fire red, lightning blue, ice cyan, void purple, earth brown, water blue, nature green, light white, memory gold), heavy battle-worn armor, sovereign powerful stance, reality warping energy around him, dark apocalyptic cyberpunk city background, ultimate boss character art, hyper detailed, cinematic epic lighting, 4K",
      boryn: "Massive protective tiger beast father figure, bipedal, warm orange fur with battle scars, kind amber eyes, broad shoulders, sitting protectively watching over, warm street alley background with graffiti, fatherly presence, urban fantasy style, game character art, hyper detailed, warm golden lighting, 4K",
      borax: "TOWERING armored lion warrior beast, bipedal MASSIVE frame, ancient battle-worn heavy armor with spikes, cold piercing eyes, watching from cyberpunk city rooftop at night, neon signs in background, absolute authority presence, the apex predator, mentor figure, dark intimidating silhouette, game boss character art, hyper detailed, dramatic noir lighting, 4K"
    };

    const result = await onGenerateImage(character.id, prompts[character.id] || prompts.kaijax);
    if (result) {
      setGeneratedImage(result);
    }
  };

  const displayImage = generatedImage || referenceImages[character.id];

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
      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-black/60 relative">
        {displayImage ? (
          <img 
            src={generatedImage ? `data:image/png;base64,${generatedImage}` : displayImage} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
            <Star className="w-16 h-16 mb-4 opacity-50" />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-cyber text-xs px-4 py-2"
              data-testid={`generate-${character.id}`}
            >
              {isGenerating ? (
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

  // All reference art gallery
  const galleryImages = [
    {
      id: 'brothers-training',
      title: 'The Shield\'s Warmth & The Mentor\'s Vigil',
      description: 'Kai and Jax sparring while Boryn watches protectively. Borax observes from the shadows.',
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

// Bible Section
const BibleSection = () => {
  const [gameBible, setGameBible] = useState(null);

  useEffect(() => {
    const fetchGameBible = async () => {
      try {
        const response = await axios.get(`${API}/bible`);
        setGameBible(response.data);
      } catch (e) {
        console.error('Failed to fetch game bible:', e);
      }
    };
    fetchGameBible();
  }, []);

  if (!gameBible) {
    return (
      <section className="min-h-screen py-24 bg-black/30 flex items-center justify-center" data-testid="bible-section">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/60">Loading the Memory Bible...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-24 bg-black/30" data-testid="bible-section">
      <div className="container-game">
        <div className="text-center mb-16">
          <p className="font-lore text-primary text-sm tracking-[0.3em] mb-4">THE SACRED TEXTS</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            THE <span className="text-primary">MEMORY BIBLE</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto font-lore italic">
            {gameBible.tagline}
          </p>
        </div>

        {/* Core Philosophy */}
        <div className="mb-16">
          <div className="card-beam p-8 text-center max-w-3xl mx-auto">
            <h3 className="font-heading text-2xl text-primary mb-4">The Franchise Pillar</h3>
            <p className="text-white/80 text-xl font-lore italic">
              "{gameBible.franchise_pillar}"
            </p>
          </div>
        </div>

        {/* Player Fantasy */}
        <div className="mb-16">
          <div className="card-beam p-6 max-w-2xl mx-auto">
            <h3 className="font-heading text-xl text-fire mb-3">The Player's Journey</h3>
            <p className="text-white/70 text-lg">
              {gameBible.player_fantasy}
            </p>
          </div>
        </div>

        {/* Tone & Genre */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="card-beam p-6">
            <h3 className="font-heading text-xl text-storm mb-4">Genre</h3>
            <div className="space-y-2">
              {gameBible.genre?.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-storm" />
                  <span className="text-white/70">{g}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-beam p-6">
            <h3 className="font-heading text-xl text-electric mb-4">Tone</h3>
            <div className="space-y-2">
              {gameBible.tone?.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-electric" />
                  <span className="text-white/70">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Coronation */}
        {gameBible.coronation && (
          <div className="mb-16">
            <div className="card-beam p-8 max-w-3xl mx-auto bg-gradient-to-b from-primary/5 to-transparent">
              <h3 className="font-heading text-2xl text-primary mb-4 text-center">The Coronation</h3>
              <p className="text-white/60 mb-4 text-center">
                <span className="text-primary">Trigger:</span> {gameBible.coronation.trigger}
              </p>
              <div className="space-y-2 mb-6">
                {gameBible.coronation.events?.map((event, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-white/70">{event}</span>
                  </div>
                ))}
              </div>
              <blockquote className="text-center text-xl font-lore text-electric italic border-t border-white/10 pt-6">
                "{gameBible.coronation.quote}"
              </blockquote>
              <p className="text-center text-sm text-white/40 mt-4">
                {gameBible.coronation.meaning || "Memory Hero → Memory King. A state change, not a buff."}
              </p>
            </div>
          </div>
        )}

        {/* Final Wisdom */}
        <div className="text-center">
          <div className="card-beam p-8 max-w-2xl mx-auto">
            <p className="font-lore text-xl text-primary mb-4">The Final Truth</p>
            <p className="text-white/60 mb-4 italic">
              "When memory becomes legend, and legend becomes truth, 
              the King shall rise from the ashes of the forgotten."
            </p>
            <p className="text-sm text-white/40">
              Memory cannot be designed out of existence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Bible Section - Complete Game Documentation
const BibleSection = () => {
  const [bibleData, setBibleData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBible = async () => {
      try {
        const response = await axios.get(`${API}/bible/full`);
        setBibleData(response.data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch bible:', e);
        setLoading(false);
      }
    };
    fetchBible();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen py-24 flex items-center justify-center">
        <div className="spinner" />
      </section>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'narrative', label: 'Narrative Bible' },
    { id: 'art', label: 'Art & UX' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'production', label: 'Production' },
    { id: 'endings', label: 'Endings' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="card-beam p-8 text-center">
        <h3 className="font-heading text-3xl text-primary mb-2">{bibleData?.title}</h3>
        <p className="font-lore text-xl text-electric mb-4">{bibleData?.subtitle}</p>
        <p className="text-white/60 italic text-lg">"{bibleData?.franchise_pillar}"</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-beam p-6">
          <h4 className="font-heading text-xl text-fire mb-4">Status</h4>
          <div className="space-y-2">
            {bibleData?.status && Object.entries(bibleData.status).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-white/50 capitalize">{key.replace('_', ' ')}</span>
                <span className="text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-beam p-6">
          <h4 className="font-heading text-xl text-storm mb-4">The Coronation</h4>
          <p className="text-white/60 text-sm mb-4">When alignment is complete, the Ninth Tail manifests. Boryn's Spiritual Echo appears.</p>
          <p className="font-lore text-electric italic">"You carried what I couldn't."</p>
        </div>
      </div>
    </div>
  );

  const renderNarrative = () => (
    <div className="space-y-6">
      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-primary mb-4">Core Narrative Law</h4>
        <p className="text-fire font-bold mb-2">{bibleData?.narrative_bible?.core_law?.rule}</p>
        <p className="text-white/60">{bibleData?.narrative_bible?.core_law?.detail}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-beam p-6">
          <h4 className="font-heading text-lg text-storm mb-4">Allowed Tone</h4>
          <ul className="space-y-1">
            {bibleData?.narrative_bible?.tone_rules?.allowed?.map((item, i) => (
              <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                <span className="text-storm">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-beam p-6">
          <h4 className="font-heading text-lg text-fire mb-4">Forbidden Tone</h4>
          <ul className="space-y-1">
            {bibleData?.narrative_bible?.tone_rules?.forbidden?.map((item, i) => (
              <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                <span className="text-fire">✗</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-lg text-void mb-4">Two-Father Doctrine</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-electric font-bold">BORYN</p>
            <p className="text-white/60 text-sm">{bibleData?.narrative_bible?.two_father_doctrine?.boryn}</p>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-storm font-bold">BORAX</p>
            <p className="text-white/60 text-sm">{bibleData?.narrative_bible?.two_father_doctrine?.borax}</p>
          </div>
        </div>
        <p className="text-white/40 text-xs mt-4 italic">{bibleData?.narrative_bible?.two_father_doctrine?.rule}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-lg text-primary mb-4">Dialogue Density Limits</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-heading text-white/80">2-3</p>
            <p className="text-xs text-white/40">Regular NPC</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading text-white/80">4-5</p>
            <p className="text-xs text-white/40">Major Characters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading text-fire">0</p>
            <p className="text-xs text-white/40">Gods</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading text-electric">1</p>
            <p className="text-xs text-white/40">Boryn's Echo</p>
          </div>
        </div>
      </div>

      <div className="card-beam p-6 bg-gradient-to-r from-fire/10 to-transparent">
        <p className="font-lore text-center text-fire italic">
          "{bibleData?.narrative_bible?.narrative_truth}"
        </p>
      </div>
    </div>
  );

  const renderArtUX = () => (
    <div className="space-y-6">
      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-primary mb-4">Visual Prime Directive</h4>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {bibleData?.art_ux_bible?.prime_directive?.rules?.map((rule, i) => (
            <div key={i} className="bg-black/40 p-4 rounded-lg text-center">
              <p className="text-storm font-bold">{rule}</p>
            </div>
          ))}
        </div>
        <p className="text-white/60 text-sm">{bibleData?.art_ux_bible?.prime_directive?.goal}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-electric mb-4">Color Law</h4>
        <p className="text-white/40 text-sm mb-4">{bibleData?.art_ux_bible?.color_law?.principle}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {bibleData?.art_ux_bible?.color_law?.colors && Object.entries(bibleData.art_ux_bible.color_law.colors).map(([color, data]) => (
            <div key={color} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${color === 'orange' ? '#FF3B30' : color === 'cyan' ? '#64D2FF' : color === 'purple' ? '#BF5AF2' : color === 'black' ? '#1a1a1a' : '#FFD60A'}20` }}>
              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: color === 'orange' ? '#FF3B30' : color === 'cyan' ? '#64D2FF' : color === 'purple' ? '#BF5AF2' : color === 'black' ? '#333' : '#FFD60A' }} />
              <p className="text-xs text-white/80 font-bold uppercase">{color}</p>
              <p className="text-xs text-white/50">{data.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-void mb-4">Animation Philosophy</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-white/40 mb-2">Movement Feel</p>
            <ul className="space-y-1">
              {bibleData?.art_ux_bible?.animation_philosophy?.movement_feel?.map((item, i) => (
                <li key={i} className="text-white/60 text-sm">• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-white/40 mb-2">Attack Rules</p>
            <ul className="space-y-1">
              {bibleData?.art_ux_bible?.animation_philosophy?.attacks?.map((item, i) => (
                <li key={i} className="text-white/60 text-sm">• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-fire text-sm mt-4 italic">{bibleData?.art_ux_bible?.animation_philosophy?.note}</p>
      </div>

      <div className="card-beam p-6 bg-gradient-to-r from-void/10 to-transparent">
        <p className="font-lore text-center text-void italic">
          "{bibleData?.art_ux_bible?.art_ux_truth}"
        </p>
      </div>
    </div>
  );

  const renderEngineering = () => (
    <div className="space-y-6">
      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-electric mb-4">Tail Expression Engine</h4>
        <p className="text-white/60 mb-4">{bibleData?.engineering_specs?.tail_expression_engine?.principle}</p>
        
        <div className="bg-black/40 p-4 rounded-lg mb-4">
          <p className="text-xs text-white/40 uppercase mb-2">Active Tail Limits</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xl font-heading text-fire">3</p>
              <p className="text-xs text-white/40">Early</p>
            </div>
            <div>
              <p className="text-xl font-heading text-electric">4-6</p>
              <p className="text-xs text-white/40">Mid</p>
            </div>
            <div>
              <p className="text-xl font-heading text-storm">~</p>
              <p className="text-xs text-white/40">End</p>
            </div>
            <div>
              <p className="text-xl font-heading text-primary">9</p>
              <p className="text-xs text-white/40">Event</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-lg">
          <p className="text-xs text-white/40 uppercase mb-2">Ninth Tail Conditions</p>
          <ul className="space-y-1">
            {bibleData?.engineering_specs?.tail_expression_engine?.ninth_tail_logic?.conditions?.map((c, i) => (
              <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                <span className="text-primary">◆</span> {c}
              </li>
            ))}
          </ul>
          <p className="text-storm text-sm mt-3 italic">{bibleData?.engineering_specs?.tail_expression_engine?.ninth_tail_logic?.note}</p>
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-void mb-4">Memory Save System</h4>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {bibleData?.engineering_specs?.memory_save_system?.philosophy?.map((p, i) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg text-center">
              <p className="text-white/60 text-sm">{p}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg">
          <p className="text-xs text-white/40 uppercase mb-2">Memory Flags Represent</p>
          <div className="flex flex-wrap gap-2">
            {bibleData?.engineering_specs?.memory_save_system?.memory_flags?.represent?.map((f, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-void/20 text-void">{f}</span>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-3 italic">{bibleData?.engineering_specs?.memory_save_system?.memory_flags?.note}</p>
        </div>
      </div>
    </div>
  );

  const renderProduction = () => (
    <div className="space-y-6">
      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-fire mb-4">Team Structure</h4>
        <p className="text-white/60 mb-4">{bibleData?.production_plan?.staffing_model?.principle}</p>
        <p className="text-storm font-bold">{bibleData?.production_plan?.staffing_model?.team_size}</p>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-electric mb-4">Tech Stack</h4>
        <div className="bg-black/40 p-4 rounded-lg mb-4">
          <p className="text-2xl font-heading text-primary mb-2">{bibleData?.production_plan?.tech_stack?.engine}</p>
          <div className="flex flex-wrap gap-2">
            {bibleData?.production_plan?.tech_stack?.why_unity?.map((reason, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">{reason}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-storm mb-4">Milestones</h4>
        <div className="space-y-4">
          {bibleData?.production_plan?.milestones && Object.entries(bibleData.production_plan.milestones).map(([phase, data]) => (
            <div key={phase} className="bg-black/40 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-heading text-lg uppercase" style={{ color: phase === 'alpha' ? '#64D2FF' : phase === 'beta' ? '#BF5AF2' : '#FF3B30' }}>{phase}</p>
                <span className="text-xs text-white/40">{data.time}</span>
              </div>
              <p className="text-white/60 text-sm italic mb-2">"{data.question}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-beam p-6">
        <h4 className="font-heading text-xl text-void mb-4">Execution Rules</h4>
        <ul className="space-y-2">
          {bibleData?.production_plan?.execution_rules?.map((rule, i) => (
            <li key={i} className="text-white/60 text-sm flex items-start gap-2">
              <span className="text-fire font-bold">{i + 1}.</span> {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderEndings = () => (
    <div className="space-y-6">
      <div className="card-beam p-6 text-center">
        <p className="font-lore text-xl text-primary mb-2">{bibleData?.multiple_endings?.principle}</p>
        <div className="flex justify-center gap-4 mt-4">
          {bibleData?.multiple_endings?.axes_tracked?.map((axis, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40">{axis}</span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {bibleData?.multiple_endings?.endings?.map((ending, i) => (
          <div key={i} className="card-beam p-6" style={{ borderColor: i === 0 ? '#FFD60A40' : i === 1 ? '#64D2FF40' : i === 2 ? '#FF3B3040' : '#BF5AF240' }}>
            <h4 className="font-heading text-lg mb-3" style={{ color: i === 0 ? '#FFD60A' : i === 1 ? '#64D2FF' : i === 2 ? '#FF3B30' : '#BF5AF2' }}>
              {ending.name}
            </h4>
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase mb-1">Requirements</p>
              <ul className="space-y-1">
                {ending.requirements?.map((req, j) => (
                  <li key={j} className="text-white/60 text-xs">• {req}</li>
                ))}
              </ul>
            </div>
            <p className="text-white/50 text-sm mb-2">{ending.outcome}</p>
            <p className="text-white/30 text-xs italic">{ending.note}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'narrative': return renderNarrative();
      case 'art': return renderArtUX();
      case 'engineering': return renderEngineering();
      case 'production': return renderProduction();
      case 'endings': return renderEndings();
      default: return renderOverview();
    }
  };

  return (
    <section className="min-h-screen py-24" data-testid="bible-section">
      <div className="container-game">
        <div className="text-center mb-12">
          <p className="font-lore text-primary text-sm tracking-[0.3em] mb-4">THE DOCUMENTATION</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4">
            GAME <span className="text-primary">BIBLE</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            The complete canon, systems, and production documentation.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
              data-testid={`bible-tab-${tab.id}`}
            >
              {tab.label}
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

export default App;
