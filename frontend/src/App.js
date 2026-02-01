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
  const sections = ['home', 'characters', 'tails', 'story', 'gods', 'regions'];

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
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633701899715-be64b730ef19?w=1920&q=80')] bg-cover bg-center opacity-20" />
      <div className="container-game text-center relative z-10 pt-20">
        <div className="animate-fade-in-up">
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
          <p className="font-lore text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            "Survival without memory is extinction with better design."
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
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

  const handleGenerate = async () => {
    const prompts = {
      kai: "Anthropomorphic sabertooth tiger warrior, bipedal muscular beast standing heroically, burning orange fur with black stripes, massive curved sabertooth fangs, fierce golden eyes like molten fire, tribal warrior markings, fire elemental energy swirling around paws, dark cyberpunk city background, epic fantasy game character art, hyper detailed, dramatic lighting, 4K",
      jax: "Anthropomorphic sabertooth tiger warrior, bipedal sleek athletic beast in strategic pose, silver-blue fur with frost patterns, sharp intelligent cyan eyes, elegant curved sabertooth fangs, ice and lightning crackling around him, cool calculating expression, dark cyberpunk city background, epic fantasy game character art, hyper detailed, dramatic lighting, 4K",
      kaijax: "KAI-JAX the Memory King - massive anthropomorphic sabertooth tiger fusion beast, towering bipedal warrior with fur shifting between fire-orange and storm-blue, NINE magnificent elemental tails (fire red, electric yellow, storm cyan, void purple, earth grey, water blue, nature green, light white, memory blue) swirling behind him, legendary curved fangs glowing with power, sovereign crown of light, eyes holding two souls, ultimate fusion form, dark epic fantasy background with elemental energy explosion, game boss character art, hyper detailed, cinematic, 4K",
      boryn: "Weathered anthropomorphic sabertooth tiger warrior, bipedal protective father figure beast, battle-scarred grey fur, kind amber eyes, broad shoulders, defensive stance with shield, scars telling stories of survival, warm protective energy, urban fantasy setting, game character art, hyper detailed, emotional lighting, 4K",
      borax: "APEX anthropomorphic sabertooth tiger god, massive towering bipedal beast of legend, ancient white fur with battle marks, enormous legendary fangs, cold piercing ice-blue eyes, absolute authority presence, frost and storm energy radiating, emotionally distant but powerful, dark throne room background, ultimate boss character art, hyper detailed, intimidating lighting, 4K"
    };

    const result = await onGenerateImage(character.id, prompts[character.id] || prompts.kaijax);
    if (result) {
      setGeneratedImage(result);
    }
  };

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
        {generatedImage ? (
          <img 
            src={`data:image/png;base64,${generatedImage}`} 
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
        {character.abilities?.slice(0, 3).map((ability, i) => (
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <CharacterCard 
              key={char.id} 
              character={char} 
              onGenerateImage={onGenerateImage}
              isGenerating={isGenerating}
            />
          ))}
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
