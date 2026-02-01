from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ImageGenerationRequest(BaseModel):
    prompt: str
    character_type: str  # 'kai', 'jax', 'kaijax', 'tail'

class ImageGenerationResponse(BaseModel):
    image_base64: str
    character_type: str
    prompt: str

class GeneratedImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    character_type: str
    prompt: str
    image_base64: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Game Data Models
class TailData(BaseModel):
    id: int
    name: str
    element: str
    color: str
    description: str
    signature_move: str
    primary_use: str

class CharacterData(BaseModel):
    id: str
    name: str
    title: str
    description: str
    abilities: List[str]
    image_url: Optional[str] = None

class StoryAct(BaseModel):
    act_number: int
    title: str
    subtitle: str
    region: str
    narrative: str
    gameplay_goals: List[str]
    systems_introduced: List[str]
    boss_test: str
    player_learns: str

# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Legends of Kai-Jax: The Memory King API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ========== FINAL CONSOLIDATED MASTER BIBLE - 8 LAYERS ==========

FINAL_MASTER_BIBLE = {
    "title": "LEGENDS OF KAI-JAX: THE MEMORY KING",
    "subtitle": "MASTER STORY & GAME BLUEPRINT BIBLE (FINAL CONSOLIDATION)",
    "tagline": "Forged in the Raging City. Crowned by Memory.",
    "status": {
        "story": "Locked",
        "world": "Coherent", 
        "systems": "Buildable",
        "scale": "Expandable",
        "identity": "Clear"
    },
    
    # LAYER I - THE ABSOLUTE CORE
    "layer_1_core": {
        "title": "LAYER I — THE ABSOLUTE CORE",
        "subtitle": "The Non-Negotiables",
        "one_sentence_truth": "Survival is not strength. Survival is memory that refuses erasure.",
        "what_it_is": [
            "A mythic action RPG",
            "A precision brawler", 
            "A movement-first survival story",
            "A legacy narrative disguised as a beast fighter"
        ],
        "what_it_is_not": [
            "Not a power fantasy",
            "Not a grind simulator",
            "Not lore-dumps and cutscenes",
            "Not 'chosen one' nonsense"
        ],
        "core_rule": "You earn everything by moving correctly under pressure."
    },
    
    # LAYER II - THE COSMOLOGY
    "layer_2_cosmology": {
        "title": "LAYER II — THE COSMOLOGY",
        "subtitle": "Why The World Exists",
        "gods_intro": "They are not characters. They are laws.",
        "sabertooth_gods": [
            {
                "name": "KAR-VOTH",
                "title": "The First Fang",
                "domain": "Electric Hunger / Initiation",
                "aspects": ["Teleportation", "Refusal", "Becoming before morality"],
                "truth": "He is why cubs bite back.",
                "color": "#FFD60A"
            },
            {
                "name": "THRYXEN",
                "title": "The Storm Sovereign",
                "domain": "Ice / Pressure / Law",
                "aspects": ["Space bends", "Authority without motion", "Kingship without mercy"],
                "truth": "He is why Sabertooth Lions command reality.",
                "color": "#64D2FF"
            },
            {
                "name": "PYRAXIS",
                "title": "The Bloodward Titan",
                "domain": "Fire / Sacrifice",
                "aspects": ["Endurance", "Protection", "Love expressed as pain"],
                "truth": "He is why fathers die standing.",
                "color": "#FF3B30"
            },
            {
                "name": "MYRR'KAI",
                "title": "The Memory Eater",
                "domain": "Web / Fusion / Continuity",
                "aspects": ["Adaptation", "Hybrid survival", "Erasure resistance"],
                "truth": "She is why extinction fails.",
                "color": "#BF5AF2"
            }
        ],
        "sabertooth_law": {
            "rule": "Each descendant carries: One dominant echo, One suppressed echo",
            "fusion_requirement": "Fusion happens only when Hunger, Law, Sacrifice, and Memory align without conflict.",
            "result": "That alignment is Kai-Jax."
        }
    },
    
    # LAYER III - CHARACTERS
    "layer_3_characters": {
        "title": "LAYER III — CHARACTERS",
        "subtitle": "Everyone That Matters",
        "characters": [
            {
                "name": "KAI",
                "icon": "🐺🔥",
                "traits": ["Speed", "Instinct", "Emotional engine", "Fights to protect"],
                "gameplay": ["Aggressive movement", "Fast entry", "Risk-taker"]
            },
            {
                "name": "JAX",
                "icon": "🐯🕷️",
                "traits": ["Precision", "Observation", "Memory holder", "Fights to control chaos"],
                "gameplay": ["Timing", "Counters", "Setup and restraint"]
            },
            {
                "name": "KAI-JAX",
                "icon": "🦁🐾",
                "title": "THE MEMORY KING",
                "traits": ["Not stronger", "Harder to erase", "Momentum-preserving fusion", "Death-delaying presence"],
                "truth": "Kaijax is not two becoming one. He is two carrying a third. That third is memory."
            },
            {
                "name": "BORYN",
                "icon": "🐯🔥",
                "title": "THE FATHER",
                "species": "Sabertooth Tiger",
                "traits": ["Foster guardian", "Brutal, loving, uneducated in philosophy", "Trains through survival"],
                "represents": ["Sacrifice", "Love", "Why the brothers fight at all"],
                "truth": "Dies once. Lives forever."
            },
            {
                "name": "BORAX",
                "icon": "🦁⚡",
                "title": "THE LAW",
                "species": "Sabertooth Lion",
                "traits": ["Mentor, uncle, blood-adjacent", "Cold, disciplined, legendary", "Never comforts"],
                "represents": ["Discipline", "Ancestry", "Why survival must mean something"],
                "truth": "Never replaces the father. Completes him."
            },
            {
                "name": "AURELION",
                "icon": "🌠",
                "title": "Silver Successor Archetype",
                "traits": ["Time-displaced warrior", "From a failed future", "Descendant of forgotten legends", "Knows the ending and hates it"],
                "gameplay_role": ["Guest ally", "Warning system", "Timeline fracture events"]
            },
            {
                "name": "SELENE",
                "icon": "🌙",
                "title": "Lunara Archetype",
                "traits": ["Oracle descendant", "Memory anchor", "Cannot fight directly", "Sees what must survive"],
                "gameplay_role": ["World-state unlocks", "Memory vault access", "Emotional balance to Aurelion"]
            }
        ]
    },
    
    # LAYER IV - FACTIONS
    "layer_4_factions": {
        "title": "LAYER IV — FACTIONS",
        "subtitle": "Friends, Enemies, Problems",
        "factions": [
            {
                "name": "THE FANG SYNDICATE",
                "icon": "🩸",
                "description": "Street predators. They steal fangs to become more than they are.",
                "purpose": ["Early enemies", "Movement checks", "Brutal but human-scale threats"]
            },
            {
                "name": "THE NULL COVENANT",
                "icon": "🕯️",
                "description": "Anti-Sabertooth cult.",
                "belief": "Inheritance is a disease.",
                "actions": ["Collect fangs", "Erase bloodlines", "Worship oblivion"],
                "timing": "Mid–late game ideological enemies"
            },
            {
                "name": "THE BEHEMOTH LEGION",
                "icon": "🐊🦎",
                "description": "Reptilian / amphibian super-creatures.",
                "creator": "ULGORR — THE WORLD BEHEMOTH",
                "goal": "End survival as evolution. Replace it with consumption."
            }
        ]
    },
    
    # LAYER V - THE 9-TAIL SYSTEM
    "layer_5_tails": {
        "title": "LAYER V — THE 9-TAIL SYSTEM",
        "subtitle": "The Game's Heart",
        "tail_rules": ["Start with 3", "End with 9", "Each tail is: An element, A function, A memory branch"],
        "ninth_tail": {
            "rules": ["No UI hype", "No explosion", "No speech"],
            "moment": ["Music fades", "Combat quiets", "Camera pulls back slightly"],
            "realization": "I survived everything.",
            "result": "That's the crown."
        }
    },
    
    # LAYER VI - GAME MODES
    "layer_6_modes": {
        "title": "LAYER VI — GAME MODES",
        "subtitle": "Complete",
        "modes": [
            {
                "name": "STORY MODE",
                "features": ["Primary experience", "Open districts", "Myth through action"]
            },
            {
                "name": "SURVIVAL / GAUNTLET",
                "features": ["Wave escalation", "Tail mastery showcase", "Leaderboard viable"]
            },
            {
                "name": "VERSUS / QUICK BATTLE",
                "features": ["Honest combat", "No lore advantages", "Movement decides winners"]
            }
        ]
    },
    
    # LAYER VII - FULL CAMPAIGN FLOW
    "layer_7_campaign": {
        "title": "LAYER VII — FULL CAMPAIGN FLOW",
        "subtitle": "High Level",
        "areas": [
            {"number": 1, "name": "Ashblock Heights", "theme": "Survival"},
            {"number": 2, "name": "Undercity Veins", "theme": "Gangs & Cults"},
            {"number": 3, "name": "Stormward Spires", "theme": "Sabertooth Truth"},
            {"number": 4, "name": "Memory Vaults", "theme": "Erased History"},
            {"number": 5, "name": "Behemoth Scar", "theme": "Endgame Threat"},
            {"number": 6, "name": "Fractured Future", "theme": "Aurelion Arc"},
            {"number": 7, "name": "The Crown Moment", "theme": "Ninth Tail"},
            {"number": 8, "name": "Final War", "theme": "Survival vs Erasure"}
        ]
    },
    
    # LAYER VIII - WHY THIS WORKS
    "layer_8_truth": {
        "title": "LAYER VIII — WHY THIS WORKS",
        "subtitle": "No Delusions",
        "reasons": [
            "Lore and mechanics are the same thing",
            "Fathers, mentors, gods all coexist without overlap",
            "Fusion is earned through failure",
            "Movement skill = narrative legitimacy",
            "Franchise-ready without copying anyone"
        ],
        "final_statement": "This is not derivative. It is ancestral."
    },
    
    # FINAL CANON LINES
    "canon_lines": [
        "The First Sabertooths did not rule the world. They taught it how to survive without them.",
        "You are not a weapon. You are a memory that learned how to fight back."
    ]
}

# API endpoint for Final Master Bible
@api_router.get("/master-bible")
async def get_master_bible():
    """Get the FINAL CONSOLIDATED Master Bible - 8 Layers"""
    return FINAL_MASTER_BIBLE

@api_router.get("/master-bible/layer/{layer_num}")
async def get_bible_layer(layer_num: int):
    """Get specific layer of the Master Bible"""
    layer_map = {
        1: FINAL_MASTER_BIBLE["layer_1_core"],
        2: FINAL_MASTER_BIBLE["layer_2_cosmology"],
        3: FINAL_MASTER_BIBLE["layer_3_characters"],
        4: FINAL_MASTER_BIBLE["layer_4_factions"],
        5: FINAL_MASTER_BIBLE["layer_5_tails"],
        6: FINAL_MASTER_BIBLE["layer_6_modes"],
        7: FINAL_MASTER_BIBLE["layer_7_campaign"],
        8: FINAL_MASTER_BIBLE["layer_8_truth"]
    }
    if layer_num in layer_map:
        return layer_map[layer_num]
    return {"error": "Layer not found"}

# ========== CHARACTER SELECT + UI + CODEX SYSTEM ==========

CHARACTER_SELECT = {
    "title": "CHARACTER SELECT SCREEN",
    "design_philosophy": "The character select screen is not a toy box. It is a hierarchy of survival. Players should feel who matters before they read anything.",
    "layout": {
        "center": {
            "description": "Large, animated model",
            "features": ["Idle breathing", "Subtle tail motion", "One tail faintly active, others dormant"]
        },
        "left_column": {
            "title": "HEROES",
            "characters": [
                {"name": "Kai-Jax", "status": "Default highlight"},
                {"name": "Kai", "status": "Locked early"},
                {"name": "Jax", "status": "Locked early"},
                {"name": "Aurelion", "status": "Unlock mid-late"},
                {"name": "Selene", "status": "Support / Oracle"}
            ]
        },
        "right_column": {
            "title": "OPPOSITION",
            "characters": [
                {"name": "Ulgorr", "status": "Locked until endgame"},
                {"name": "Korthyx Prime", "status": "Available"},
                {"name": "Sybeth", "status": "Available"},
                {"name": "Varkesh", "status": "Available"},
                {"name": "Covenant Elites", "status": "Variants"}
            ]
        },
        "bottom_bar": ["Mode toggle: Story / Survival / Versus", "Tail Loadout (icons only)", "Difficulty indicator reacts to tail count"]
    },
    "visual_rules": ["No bright arcade colors", "Muted mythic palette", "Motion is subtle, never flashy", "Ninth Tail never visible here"],
    "hover_behavior": {
        "effects": ["Camera tightens", "Ambient audio shifts", "A single word appears (not a bio)"],
        "examples": [
            {"character": "Kai-Jax", "word": "REMEMBERS"},
            {"character": "Borax", "word": "JUDGES"},
            {"character": "Ulgorr", "word": "DESIGNS"},
            {"character": "Boryn", "word": "PROTECTS"},
            {"character": "Korthyx", "word": "ADAPTS"}
        ]
    }
}

MATCHUP_ART_PROMPTS = [
    {
        "title": "KAI-JAX vs ULGORR",
        "subtitle": "MEMORY vs DESIGN",
        "prompt": "A cinematic split-frame illustration showing Kai-Jax in the foreground, calm and grounded with one dark memory tail faintly arcing behind him, facing a colossal amphibian-reptilian titan looming in the background. Ulgorr's body reshapes the environment with cold, geometric precision while Kai-Jax stands unaffected. The contrast is organic memory versus engineered extinction. Mythic scale, restrained color, dramatic lighting.",
        "color": "#2E2EFE"
    },
    {
        "title": "BORAX vs KORTHYX PRIME",
        "subtitle": "LAW vs ADAPTATION",
        "prompt": "A towering sabertooth lion mentor standing perfectly still as a sleek synthetic reptilian warrior lunges toward him mid-adaptation. Lightning arcs subtly around Borax's mane while Korthyx's armor shifts shape. The moment freezes before impact, emphasizing restraint versus calculation. Cold steel tones versus storm-charged gold.",
        "color": "#FFD60A"
    },
    {
        "title": "BORYN vs VARKESH",
        "subtitle": "SACRIFICE vs THEFT",
        "prompt": "A brutal close-quarters battle between a battered sabertooth tiger guardian and a grotesque crocodile-toad monster covered in stolen fangs. Boryn stands wounded but unyielding, blocking an attack meant for unseen cubs behind him. Ember glow clashes against sickly green regeneration. Emotional, grounded, visceral.",
        "color": "#FF3B30"
    },
    {
        "title": "AURELION vs SYBETH",
        "subtitle": "WARNING vs ERASURE",
        "prompt": "A fractured time-scarred silver warrior clashing with a floating serpent-bat entity whose sonic waves distort reality. Light cracks through Aurelion's body while Sybeth's presence warps perception itself. The scene feels unstable and desperate, as if reality may collapse at any moment.",
        "color": "#BF5AF2"
    }
]

CODEX_SYSTEM = {
    "title": "THE MEMORY LEDGER",
    "description": "This replaces boring lore dumps.",
    "unlock_rules": ["Witnessed events", "Lost NPCs", "Tail awakenings", "Boss encounters"],
    "never": "Never through menus alone.",
    "structure": {
        "tabs": [
            {"name": "KNOWN", "description": "What the world believes"},
            {"name": "REMEMBERED", "description": "What actually happened"},
            {"name": "LOST", "description": "What cannot be recovered"},
            {"name": "PLAYER NOTE", "description": "One short line reflecting player choices"}
        ]
    },
    "example_entries": [
        {
            "entry": "KAI-JAX",
            "known": "A fused sabertooth anomaly.",
            "remembered": "Two brothers who refused to forget each other.",
            "lost": "The life they would have had.",
            "player_note": "I stopped running."
        },
        {
            "entry": "THE NINTH TAIL",
            "known": "A myth. A legend. A lie.",
            "remembered": "Alignment without conflict.",
            "lost": "Nothing.",
            "player_note": "The world went quiet."
        },
        {
            "entry": "BORYN",
            "known": "A sabertooth guardian. Deceased.",
            "remembered": "A father who bought time with his life.",
            "lost": "The future he wanted for them.",
            "player_note": "He never looked away."
        },
        {
            "entry": "ULGORR",
            "known": "The Architect of Design.",
            "remembered": "A god who forgot what survival meant.",
            "lost": "His own memory.",
            "player_note": "He couldn't adapt."
        }
    ],
    "tail_codex_ui": {
        "display": "Tails shown as inked silhouettes",
        "rules": [
            "Only active tails are solid",
            "Dormant tails pulse faintly",
            "Ninth Tail never labeled by name"
        ],
        "hover": "Shows function, not lore. Lore unlocks later, if at all."
    }
}

# API Endpoints for UI/Codex
@api_router.get("/ui/character-select")
async def get_character_select():
    """Get Character Select Screen specs"""
    return CHARACTER_SELECT

@api_router.get("/ui/matchups")
async def get_matchup_prompts():
    """Get Matchup Art Prompts"""
    return MATCHUP_ART_PROMPTS

@api_router.get("/ui/codex")
async def get_codex_system():
    """Get Codex System specs"""
    return CODEX_SYSTEM

# ========== MASTER BLUEPRINT - COMPLETE SET ==========

MASTER_BLUEPRINT = {
    "title": "LEGENDS OF KAI-JAX: THE MEMORY KING",
    "subtitle": "MASTER BLUEPRINT — PRODUCTION CANON LOCKED",
    "version": "Final Delivery — Image Canon Locked",
    "franchise_spine": "The First Sabertooths did not rule the world. They taught it how to survive without them.",
    "gameplay_style": "Open-world Monster Hunter meets Pokémon - hunt, capture, battle. Lions, tigers, bears - oh my!",
    
    # IMAGE CANON - LOCKED
    "image_canon": {
        "status": "PRODUCTION CANON - NO REDESIGNS",
        "allies": {
            "kai": {
                "title": "Prime Hero",
                "status": "FINAL / DO NOT TOUCH",
                "palette": ["Coal black", "Burnt orange", "Ember gold"],
                "eyes": "Vivid green",
                "claws": "Molten amber",
                "silhouette": "Forward lunge, broad chest, leader posture"
            },
            "jax": {
                "title": "Prime Striker", 
                "status": "FINAL / DO NOT TOUCH",
                "palette": ["Pitch black", "Electric blue"],
                "eyes": "Ember gold (solid)",
                "claws": "Ice-blue steel",
                "silhouette": "Speed, menace, precision"
            },
            "kaijax": {
                "title": "The Memory King",
                "status": "LOCKED / EVOLUTION READY",
                "palette_split": {"kai_side": "Ember gold / orange", "jax_side": "Electric blue"},
                "tails": ["Tail 1: flame/amber", "Tail 2: ice/blue", "Tail 3: bond tail (neutral dark)"],
                "eyes": "Heterochromia (one green, one gold)",
                "rule": "Only 1-2 tails glow at a time. Evolves to 9 tails."
            }
        },
        "fathers": {
            "boryn": {
                "title": "The Shield Father",
                "status": "FINAL / FATHER FIGURE",
                "species": "Sabertooth Tiger",
                "palette": ["Bone white", "Charcoal", "Dried blood accents"],
                "outfit": "Martial gi pants only, shirtless",
                "eyes": "Cold pale gold",
                "silhouette": "Tall, lean, blade-like",
                "role": "Protector. Sacrifices himself. His ECHO crowns Kai-Jax at 9th tail."
            },
            "borax": {
                "title": "The Sabertooth Law",
                "status": "FINAL / MENTOR FIGURE",
                "species": "Sabertooth Lion",
                "palette": ["Rust red", "Ash", "Scorched iron"],
                "armor": "Apocalyptic militia, heavy, scarred",
                "eyes": "Deep molten red",
                "silhouette": "Wide, immovable, king-of-ruins",
                "role": "Mentor. Trains without comfort. His ECHO crowns Kai-Jax at 9th tail."
            }
        },
        "wildcard": {
            "codename": "The Veil",
            "status": "SLOT RESERVED - NOT DEPLOYED",
            "palette": ["Void black", "Faint violet fractures"],
            "role": "Manipulator / late-game threat",
            "rule": "Never fully lit on screen"
        },
        "canon_rules": [
            "Base images are frozen",
            "Changes only via: skins, story corruption, power ascension, alternate timelines",
            "No redesigns disguised as tweaks"
        ]
    },
    
    # CORONATION - BOTH FATHERS CROWN KAI-JAX
    "ninth_tail_coronation": {
        "trigger": "9th Tail manifestation through choice, not rage",
        "cinematic": "BOTH fathers' echoes (Boryn + Borax) appear together and crown Kai-Jax",
        "boryn_line": "You carried what I couldn't.",
        "borax_line": "Stand. Be remembered.",
        "moment": "The world stops. Memory refuses erasure. The King is crowned by love AND law."
    },
    
    # 📕 STORY & LORE BIBLE
    "story_lore_bible": {
        "title": "STORY & LORE BIBLE",
        "subtitle": "Narrative Authority",
        "core_thesis": "Survival without memory is extinction with better design.",
        "the_world": {
            "description": "A mythic megacity fractured by forgotten gods and engineered extinction",
            "rules": [
                "Urban verticality is symbolic: climb = survive, fall = erasure",
                "The world reacts to memory, not morality"
            ]
        },
        "mythology": {
            "principle": "The First Sabertooth Gods do not intervene. They echo.",
            "gods": [
                {"name": "Kar-Voth", "domain": "Hunger / Initiation", "element": "Electric", "color": "#FFD60A"},
                {"name": "Thryxen", "domain": "Law / Sovereignty", "element": "Storm / Ice", "color": "#64D2FF"},
                {"name": "Pyraxis", "domain": "Sacrifice / Endurance", "element": "Fire", "color": "#FF3B30"},
                {"name": "Myrr'Kai", "domain": "Memory / Adaptation", "element": "Web / Void", "color": "#BF5AF2"}
            ],
            "note": "They are not characters. They are principles."
        },
        "two_father_doctrine": {
            "title": "The Two-Father Doctrine (Emotional Spine)",
            "boryn": {
                "title": "The Father (Shield)",
                "traits": ["Street survival, ruthless love", "Dies buying time", "Lives on as Ember Memory"]
            },
            "borax": {
                "title": "The Sabertooth (Law)",
                "traits": ["Legendary apex", "Emotionally distant", "Trains without comfort", "Never replaces the father"]
            },
            "truth": "Kaijax is born from love + law + memory, not power."
        }
    },
    
    # 📘 GAME SYSTEMS BIBLE
    "game_systems_bible": {
        "title": "GAME SYSTEMS BIBLE",
        "subtitle": "Mechanics Authority",
        "core_loop": "Move → Fight → Remember → Adapt",
        "nine_tail_system": {
            "title": "The Nine-Tail Memory System (Final)",
            "rules": [
                "Kai-Jax always has 9 tails",
                "Expression is contextual, not additive",
                "Tails = loadout + movement + memory powers"
            ],
            "progression": [
                "Story chapters unlock tail tiers",
                "Skill mastery upgrades tail behavior",
                "Memory fragments unlock abilities"
            ],
            "milestones": [
                {"tails": "3", "stage": "Base Fusion", "description": "Memory Hero born"},
                {"tails": "4-6", "stage": "Discipline & Evolution", "description": "Law shapes power"},
                {"tails": "7-8", "stage": "Crisis & Sacrifice", "description": "Choices define legacy"},
                {"tails": "9", "stage": "Alignment", "description": "Memory King crowned"}
            ],
            "ninth_tail": {
                "truth": "Appears only when inner conflict ends",
                "properties": ["No spectacle", "No escalation", "The world stops correcting him"],
                "moment": "The Ninth Tail settles."
            }
        },
        "movement_philosophy": {
            "principles": ["Momentum-based", "Precision restores flow", "Sloppiness punished", "No float, no spam, no god-mode"],
            "feel": "A predator who knows exactly where he will land."
        },
        "memory_vs_design": {
            "title": "Memory vs Design (Systemic War)",
            "memory": {
                "alignment": "Player",
                "rewards": ["Variation", "Protection", "Sacrifice"],
                "effects": ["Expands control windows", "Stabilizes fusion"]
            },
            "design": {
                "alignment": "Enemy",
                "behavior": ["Learns habits", "Compresses inputs", "Deletes mechanics"]
            },
            "truth": "Erasure deletes everything except Kaijax. He is incompatible with deletion."
        }
    },
    
    # 📗 ENEMY & FACTION BIBLE
    "enemy_faction_bible": {
        "title": "ENEMY & FACTION BIBLE",
        "subtitle": "Opposition Authority",
        "void_fang_covenant": {
            "description": "A cult of outcomes.",
            "belief": "Memory rots. Design endures.",
            "goals": [
                "Harvest Sabertooth relics",
                "Create synthetic apexes",
                "Prevent the Ninth Tail"
            ],
            "elite_commanders": [
                {"name": "Varkesh the Grafted", "specialty": "Regeneration & targeting"},
                {"name": "Sybeth the Choir Mother", "specialty": "Sensory/UI denial"},
                {"name": "Korthyx Prime", "specialty": "Adaptive combat intelligence"}
            ],
            "note": "They are tests, not bosses."
        },
        "ulgorr": {
            "title": "Ulgorr — The Fangless Architect",
            "role": "Final Antagonist",
            "description": "Ancient amphibian–reptilian behemoth",
            "traits": ["Wears stolen Sabertooth fangs", "Designs extinction"],
            "belief": "Memory is an evolutionary flaw.",
            "plan": [
                "Convert Sabertooth fangs into catalysts",
                "Engineer obedient apex predators",
                "End memory-based survival"
            ],
            "weakness": "He fears Kaijax because: Kaijax adapts with memory."
        }
    },
    
    # 📙 ACT STRUCTURE
    "act_structure": {
        "title": "ACT STRUCTURE",
        "subtitle": "Story + Game Flow",
        "acts": [
            {
                "number": 1,
                "title": "THE FATHER ERA",
                "events": ["Kai & Jax as cubs", "Brutal survival training", "No prophecy", "Father dies buying time"],
                "theme": "Protection"
            },
            {
                "number": 2,
                "title": "THE SHADOW WATCHER",
                "events": ["Borax observes, judges", "Fusion teased but denied", "World grows hostile"],
                "theme": "Discipline"
            },
            {
                "number": 3,
                "title": "THE FRACTURE",
                "events": ["Sector-7 collapse", "Fusion under death pressure", "3 tails active"],
                "theme": "Survival through memory"
            },
            {
                "number": 4,
                "title": "THE MEMORY WAR",
                "events": ["Void Fang Covenant exposed", "Tails 4–8 unlocked", "Aurelion & Selene appear", "Erasure becomes common"],
                "theme": "Adaptation"
            },
            {
                "number": 5,
                "title": "THE MEMORY KING",
                "events": ["Ulgorr revealed fully", "Synthetic apex war", "Ninth Tail crowns Kaijax"],
                "theme": "Alignment"
            }
        ],
        "end_truth": "The world survives not because Kaijax wins — but because it remembers why it should."
    },
    
    # 📒 MODE BREAKDOWN
    "mode_breakdown": {
        "title": "MODE BREAKDOWN",
        "modes": [
            {
                "name": "Story Mode",
                "features": ["Full narrative", "Tail progression", "World reaction"]
            },
            {
                "name": "Survival / Gauntlet",
                "features": ["Forces tail rotation", "Punishes habits", "Tests mastery"]
            },
            {
                "name": "Versus",
                "features": ["Limited tail sets", "No Ninth Tail", "Balance through restraint"]
            }
        ]
    },
    
    # HANDOFF STRUCTURE
    "studio_handoff": {
        "title": "How This Hands Off to a Studio",
        "deliverables": [
            {"bible": "Narrative Bible", "team": "Writers"},
            {"bible": "Systems Bible", "team": "Engineers"},
            {"bible": "Enemy Bible", "team": "Combat designers"},
            {"bible": "Act Map", "team": "Producers"},
            {"bible": "Visual prompts", "team": "Artists"}
        ],
        "status": "AAA-ready"
    }
}

# Updated API endpoint for complete master blueprint
@api_router.get("/blueprint")
async def get_master_blueprint():
    """Get the complete Master Blueprint"""
    return MASTER_BLUEPRINT

@api_router.get("/blueprint/story")
async def get_story_lore_bible():
    """Get Story & Lore Bible"""
    return MASTER_BLUEPRINT["story_lore_bible"]

@api_router.get("/blueprint/systems")
async def get_game_systems_bible():
    """Get Game Systems Bible"""
    return MASTER_BLUEPRINT["game_systems_bible"]

@api_router.get("/blueprint/enemies")
async def get_enemy_faction_bible():
    """Get Enemy & Faction Bible"""
    return MASTER_BLUEPRINT["enemy_faction_bible"]

@api_router.get("/blueprint/acts")
async def get_act_structure():
    """Get Act Structure"""
    return MASTER_BLUEPRINT["act_structure"]

@api_router.get("/blueprint/modes")
async def get_mode_breakdown():
    """Get Mode Breakdown"""
    return MASTER_BLUEPRINT["mode_breakdown"]

# ========== FULL GAME BIBLE DATA ==========

NARRATIVE_BIBLE = {
    "title": "NARRATIVE BIBLE — CANON & WRITING LAW",
    "version": "1.1 — Locked",
    "purpose": "Define what can be written, how it must feel, and what is never allowed so narrative always reinforces gameplay and theme.",
    "core_law": {
        "rule": "Story never explains mechanics. Mechanics reveal story.",
        "detail": "Writers do not 'teach' systems. They react to what the player has already done."
    },
    "tone_rules": {
        "allowed": ["Grounded", "Restrained", "Emotionally honest", "Mythic without spectacle-chasing", "Street-level truth with cosmic weight"],
        "forbidden": ["Camp", "Anime monologues", "Quippy Marvel dialogue", "Lore dumps", "Chosen one language"],
        "never_say": ["You are the chosen one", "This was your destiny", "Only you can save the world"]
    },
    "character_constraints": {
        "kai_jax_prefusion": {
            "rules": ["They do not philosophize", "They react emotionally, not intellectually", "Their bond is shown through instinct, not dialogue"],
            "note": "They argue rarely. They move together naturally."
        },
        "kaijax_fusion": {
            "rules": ["Speaks less than either Kai or Jax alone", "When he speaks, it is short", "He never explains himself"],
            "feel": "A single voice carrying two histories refusing to justify its existence"
        },
        "boryn": {
            "rules": ["Never idealized", "Never poetic", "His love is practical"],
            "teaches_by": ["Stepping in front of danger", "Fixing mistakes", "Buying time"],
            "note": "His sacrifice is not heroic framing. It is necessary brutality."
        },
        "borax": {
            "rules": ["Never comforts", "Never explains emotions", "Never apologizes"],
            "never_says": ["I'm proud of you", "You did well"],
            "note": "If he approves, the world responds, not his words."
        }
    },
    "two_father_doctrine": {
        "boryn": "Why life matters",
        "borax": "Why survival needs restraint",
        "rule": "They never overlap. They never replace each other. They never compete."
    },
    "mythology_handling": {
        "sabertooth_gods": ["Never appear fully", "Never speak directly", "Never intervene"],
        "exist_as": ["Environmental echoes", "Distorted murals", "Half-remembered rituals", "Instinctual reactions"],
        "rule": "If a god solves a problem → scene is cut."
    },
    "erasure_writing": {
        "principle": "Erasure is not an explosion. Erasure is absence.",
        "allowed": ["Conversations that never finish", "NPCs who stop mid-sentence", "Locations that feel 'smaller' than before", "Missing UI with no comment"],
        "forbidden": ["Dramatic screams", "'Reality is breaking!' dialogue", "Characters explaining erasure"],
        "example_lines": ["Was there a door here?", "I thought someone lived here."]
    },
    "fusion_revelation": {
        "rules": ["Has almost no dialogue", "Uses sound, movement, silence", "Is readable even with subtitles off"],
        "dialogue_limit": "One breath, one word, or a scream. Anything else is cut."
    },
    "coronation": {
        "boryn_echo": ["Appears once", "Speaks once", "Leaves immediately"],
        "approved_lines": ["You carried what I couldn't.", "Stand. Be remembered."],
        "rule": "No goodbye speeches. No reassurance. The crown is recognition, not permission."
    },
    "dialogue_density": {
        "regular_npc": "2–3 lines",
        "major_characters": "4–5 lines",
        "gods": "0 lines",
        "boryn_echo": "1 line"
    },
    "narrative_truth": "If the story makes the player feel important without earning it through play, it is lying."
}

ART_UX_BIBLE = {
    "title": "ART & UX BIBLE — VISUAL LAW",
    "version": "1.1 — Locked",
    "purpose": "Ensure every visual choice clarifies gameplay, reinforces myth, and never lies to the player.",
    "prime_directive": {
        "rules": ["Clarity beats spectacle", "Weight beats speed", "Meaning beats noise"],
        "goal": "The game must look fun at a glance and serious up close. Kids see color and motion. Adults feel consequence."
    },
    "art_direction": {
        "world_look": ["Stylized realism", "Exaggerated silhouettes", "Readable forms in motion", "Urban grit + mythic geometry"],
        "rules": ["Nothing is photoreal", "Nothing is flat"],
        "feel": "The city should feel built, worn, and remembered."
    },
    "color_law": {
        "principle": "Colors are language, not decoration.",
        "colors": {
            "orange": {"meaning": "Sacrifice / Father", "usage": "Heavy hits, last-stand states"},
            "cyan": {"meaning": "Law / Discipline", "usage": "Precision timing, denial zones"},
            "purple": {"meaning": "Memory / Fusion", "usage": "Tails, anchors, recall effects"},
            "black": {"meaning": "Erasure / Design", "usage": "Absence, missing UI, null zones"},
            "gold": {"meaning": "Alignment / Crown", "usage": "Rare, calm, never flashy"}
        },
        "forbidden": ["Never mix colors without meaning", "Never rainbow-blast outside fusion birth", "Gold is earned, never spammed"]
    },
    "silhouette_rules": {
        "kaijax": "Tall, lean, forward-weighted. Tails form readable fan shape. Even in shadow, the tails identify him.",
        "enemies": "Each faction has distinct outline. Covenant = clean, symmetrical. Fang Syndicate = jagged, asymmetrical.",
        "rule": "Silhouette tells allegiance before color does."
    },
    "animation_philosophy": {
        "movement_feel": ["Heavy gravity", "Short airtime", "Clear commitment frames"],
        "rules": ["No float", "No animation-cancel soup"],
        "attacks": ["Strong anticipation", "Violent follow-through", "Visible recovery"],
        "note": "A missed hit should look dangerous."
    },
    "tail_animation": {
        "principle": "Tails are not cosmetics. They are independent actors.",
        "rules": ["Each tail moves with purpose", "Idle tails subtly react to danger", "Active tail overrides idle motion", "Never animate all tails the same way"],
        "bad": ["Symmetrical tail swaying", "Idle loops during combat"],
        "good": ["One tail anchoring", "One tail coiling", "One tail twitching under pressure"]
    },
    "combat_vfx": {
        "hits": ["Fewer particles", "Sharper shapes", "Shorter lifespan"],
        "must_show": ["Direction", "Force", "Consequence"],
        "impact_hierarchy": {
            "small_hits": "Sparks, dust",
            "heavy_hits": "Camera micro-shake, sound drop",
            "critical_moments": "Hit-stop (1–3 frames only)"
        },
        "rule": "If everything explodes, nothing matters."
    },
    "erasure_visuals": {
        "principle": "Erasure is absence, not destruction.",
        "allowed": ["Missing shadows", "Holes where UI used to be", "Silent animations", "Desaturated environments"],
        "forbidden": ["Screen tearing spam", "Glitch filters everywhere", "Loud distortion effects"],
        "note": "Design removes things politely. That's what makes it horrifying."
    },
    "ui_philosophy": {
        "core_rules": ["Readable in combat", "Minimal at rest", "Reacts to pressure", "Disappears as mastery increases"],
        "hud_layout": {
            "top_left": "Health (thick, bold, shakes on impact)",
            "top_right": "Dread / Pressure (no numbers)",
            "bottom_center": "Fusion / Resonance"
        },
        "rule": "No mini-map clutter. Environment teaches navigation."
    },
    "art_ux_truth": "If the player can't tell what happened, the art failed."
}

ENGINEERING_SPECS = {
    "tail_expression_engine": {
        "title": "TAIL EXPRESSION ENGINE",
        "principle": "All 9 tails always exist. Only a subset may express. Expression is contextual, volatile, revocable.",
        "data_model": {
            "tail": ["id: 1–9", "aspect: Hunger | Law | Sacrifice | Memory", "state: Dormant | Available | Active | Suppressed | Locked", "fatigue: 0.0–1.0", "resonance: 0.0–1.0", "last_used_timestamp"],
            "tail_manager": ["tails[9]", "max_active_tails", "expression_ruleset", "world_pressure"]
        },
        "active_limits": {
            "early_game": 3,
            "mid_game": "4–6",
            "endgame": "contextual",
            "ninth_tail": "event-only"
        },
        "fatigue_system": "Every use increases fatigue. Repetition accelerates fatigue. Fatigue suppresses tail temporarily. This is how you kill cheese without patch notes.",
        "ninth_tail_logic": {
            "conditions": ["All other tails balanced", "Fusion stability > 0.9", "No panic input for sustained duration", "A choice made under pressure"],
            "effect": "World pressure stabilizes. Erasure pauses. No damage buff. Only clarity.",
            "note": "That's why it's a crown, not a weapon."
        }
    },
    "memory_save_system": {
        "title": "MEMORY SAVE & WORLD SERIALIZATION",
        "philosophy": ["No save scumming", "No binary morality", "Memory persists even when content disappears"],
        "save_structure": ["player_state", "tail_states", "memory_flags", "npc_registry", "world_modifiers", "erasure_log", "timeline_hash"],
        "memory_flags": {
            "represent": ["Mercy shown", "Sacrifice made", "NPC protected", "Pattern broken", "Panic overcome"],
            "note": "They do not say what happened. They say how it happened."
        },
        "npc_registry": {
            "fields": ["id", "alive: boolean", "remembers_player: boolean", "memory_depth: 0–3", "erasure_resistant: boolean"],
            "rule": "If an NPC dies: They are gone. Systems tied to them weaken. World feels colder. No reload fixes that."
        },
        "timeline_hash": {
            "purpose": "Anti-retcon. If player exploits reloads, world remembers the attempt.",
            "effects": ["NPC distrust", "Increased Design pressure", "Harsher suppression"]
        }
    }
}

PRODUCTION_PLAN = {
    "staffing_model": {
        "principle": "Small senior team. High trust. Zero passengers.",
        "core_leadership": [
            {"role": "Creative Director", "owns": ["Canon", "Tie-breaking", "Tone protection"]},
            {"role": "Lead Gameplay Engineer", "owns": ["PlayerState", "Tail Engine", "Combat feel"]},
            {"role": "Technical Director", "owns": ["Performance", "Build stability", "Tooling"]},
            {"role": "Narrative Systems Designer", "owns": ["Memory Flags", "NPC persistence", "Erasure logic"]}
        ],
        "core_team": [
            "Gameplay Engineer (Movement / AI)",
            "Environment / Level Designer",
            "Technical Artist",
            "UI / UX Designer"
        ],
        "team_size": "Core: 8–10 people. Max at peak: 14–16. If you hit 20+: something went wrong."
    },
    "tech_stack": {
        "engine": "Unity (HDRP or URP)",
        "why_unity": ["Fast iteration", "Mature tooling", "Custom systems friendly", "Easier hiring"],
        "architecture": ["Pure C# gameplay core", "ScriptableObjects for data", "No logic in untestable MonoBehaviours"],
        "ai": ["Custom Behavior Trees", "Utility scoring for adaptation", "No difficulty sliders"],
        "target_platforms": {"beta": "PC (Windows)", "launch": "PC, Console if earned"}
    },
    "milestones": {
        "alpha": {
            "time": "6–8 months",
            "question": "Does the game actually work?",
            "must_have": ["Full PlayerState", "Tail Expression Engine", "Memory Save System", "One region", "Fusion playable", "One adaptive boss", "Zero crashes >30 min"]
        },
        "beta": {
            "time": "4–6 months",
            "question": "Does it feel like a real game?",
            "must_have": ["2–3 regions", "Multiple factions active", "Memory consequences visible", "2+ endings reachable", "Full onboarding", "Performance locked"]
        },
        "launch": {
            "time": "3 months",
            "question": "Is this worth existing publicly?",
            "must_have": ["Full story spine", "Endgame functional", "No soft-locks", "No save corruption", "Accessibility pass"]
        }
    },
    "execution_rules": [
        "No system enters the game without a failure mode",
        "No mechanic explains itself with text first",
        "If a feature feels safe, it is wrong",
        "If everyone agrees, someone isn't thinking",
        "Memory always beats optimization"
    ]
}

FACTION_WAR = {
    "core_rule": "The world is never neutral. If Kai-Jax does nothing, Design wins by default.",
    "factions": [
        {"name": "Fang Syndicate", "type": "Street power. Opportunists. Momentum-based control."},
        {"name": "Void Fang Covenant", "type": "Design extremists. Surgical. Erasure-based expansion."},
        {"name": "Fracture Circle", "type": "Unstable allies. Memory carriers. Can collapse."},
        {"name": "Sabertooth Echoes", "type": "Not a faction. A pressure gradient. Shows up when alignment shifts."}
    ],
    "region_state": ["controlling_faction", "control_strength (0–100)", "memory_density", "erasure_density", "instability_level"],
    "control_shifts_through": ["Mission outcomes", "NPC survival", "Tail expression patterns", "Time spent inactive"]
}

MULTIPLE_ENDINGS = {
    "principle": "Endings are not chosen. They are survived.",
    "axes_tracked": ["Memory Preservation", "Alignment Stability", "Design Containment"],
    "endings": [
        {
            "name": "The Memory King (True Crown)",
            "requirements": ["Ninth Tail manifested through choice, not rage", "Fracture Circle largely intact", "Erasure contained, not reversed"],
            "outcome": "Ulgorr defeated but not destroyed. World remains scarred but alive. Kai-Jax crowned by memory, not force.",
            "note": "This is not 'good.' It is earned."
        },
        {
            "name": "The Lone Sovereign",
            "requirements": ["Ninth Tail achieved through sacrifice", "Allies lost", "High Design pressure survived"],
            "outcome": "Kai-Jax rules a quieter world. Fewer systems active. Less chaos, less life.",
            "note": "Stable. Empty. Sad."
        },
        {
            "name": "The Designed World",
            "requirements": ["Failure to balance tails", "Over-specialization", "Memory collapse"],
            "outcome": "Ulgorr's logic partially succeeds. World survives efficiently. Player wins mechanically, loses philosophically.",
            "note": "This ending does not feel like failure. That's the horror."
        },
        {
            "name": "The Broken Loop (Rare)",
            "requirements": ["Timeline abuse", "Save exploitation", "Forced reload behavior"],
            "outcome": "World destabilizes. Ending is abrupt, unresolved.",
            "note": "The game silently judges you."
        }
    ]
}

# API Endpoints for Bible
@api_router.get("/bible/narrative")
async def get_narrative_bible():
    """Get the complete Narrative Bible"""
    return NARRATIVE_BIBLE

@api_router.get("/bible/art-ux")
async def get_art_ux_bible():
    """Get the Art & UX Bible"""
    return ART_UX_BIBLE

@api_router.get("/bible/engineering")
async def get_engineering_specs():
    """Get Engineering Specifications"""
    return ENGINEERING_SPECS

@api_router.get("/bible/production")
async def get_production_plan():
    """Get Production Plan"""
    return PRODUCTION_PLAN

@api_router.get("/bible/factions")
async def get_faction_war():
    """Get Faction War System"""
    return FACTION_WAR

@api_router.get("/bible/endings")
async def get_multiple_endings():
    """Get Multiple Endings Architecture"""
    return MULTIPLE_ENDINGS

@api_router.get("/bible/full")
async def get_full_bible():
    """Get the COMPLETE Game Bible"""
    return {
        "title": "LEGENDS OF KAI-JAX: THE MEMORY KING",
        "subtitle": "MASTER STORY & GAME BLUEPRINT BIBLE",
        "version": "1.1 — Canon Locked",
        "tagline": "Forged in the Raging City. Crowned by Memory.",
        "franchise_pillar": "Survival without memory is extinction with better design.",
        "narrative_bible": NARRATIVE_BIBLE,
        "art_ux_bible": ART_UX_BIBLE,
        "engineering_specs": ENGINEERING_SPECS,
        "production_plan": PRODUCTION_PLAN,
        "faction_war": FACTION_WAR,
        "multiple_endings": MULTIPLE_ENDINGS,
        "tails": [t.model_dump() for t in TAILS_DATA],
        "characters": [c.model_dump() for c in CHARACTERS_DATA],
        "story_acts": [a.model_dump() for a in STORY_ACTS],
        "gods": SABERTOOTH_GODS,
        "regions": WORLD_REGIONS,
        "status": {
            "lore": "Locked",
            "systems": "Aligned",
            "narrative": "Constrained",
            "art_ux": "Governed",
            "production": "Roadmap Locked"
        }
    }

TAILS_DATA = [
    TailData(id=1, name="Ember Tail", element="Fire", color="#FF3B30", 
             description="Burst damage with ignite stacks. The first tail awakened, born from rage.",
             signature_move="Flare Lash", primary_use="Damage"),
    TailData(id=2, name="Gale Tail", element="Wind", color="#64D2FF",
             description="Mobility and air control. Freedom through the skies.",
             signature_move="Ridge Step", primary_use="Mobility"),
    TailData(id=3, name="Shade Tail", element="Shadow", color="#BF5AF2",
             description="Stealth, feints, and counter setups. The silent predator.",
             signature_move="Ghost Reversal", primary_use="Control"),
    TailData(id=4, name="Volt Tail", element="Lightning", color="#FFD60A",
             description="Speed and stun windows. Strike before they blink.",
             signature_move="Snap Bind", primary_use="Speed"),
    TailData(id=5, name="Stone Tail", element="Earth", color="#8B8B8B",
             description="Guard break and armor. Unmovable. Unbreakable.",
             signature_move="Quake Hook", primary_use="Defense"),
    TailData(id=6, name="Tide Tail", element="Water", color="#007AFF",
             description="Sustain, cleanse, and water traversal. Flow like the endless sea.",
             signature_move="Undertow Loop", primary_use="Sustain"),
    TailData(id=7, name="Thorn Tail", element="Nature", color="#30D158",
             description="Traps and area control. The jungle remembers.",
             signature_move="Briar Net", primary_use="Area Control"),
    TailData(id=8, name="Prism Tail", element="Light", color="#FFFFFF",
             description="Reflect and counter tech. Turn their power against them.",
             signature_move="Mirror Cut", primary_use="Counter"),
    TailData(id=9, name="Void Tail", element="Memory/Reality", color="#2E2EFE",
             description="Reality edit ability. The final tail. The crown of sovereignty.",
             signature_move="Architect's Denial", primary_use="Ultimate"),
]

CHARACTERS_DATA = [
    CharacterData(
        id="kai",
        name="KAI",
        title="Prime Hero",
        description="The elder brother - coal black and burnt orange fur with ember gold accents. Vivid green eyes that pierce through darkness. Molten amber claws that burn with every strike. Forward lunge posture, broad chest, natural leader. Always wearing his signature jacket.",
        abilities=["Fire Claws", "Ember Strike", "Web Shot", "Graffiti Tag", "Protective Fury"]
    ),
    CharacterData(
        id="jax",
        name="JAX",
        title="Prime Striker",
        description="The younger brother - pitch black fur with electric blue accents. Solid ember gold eyes that calculate every move. Ice-blue steel claws crackling with lightning. Sharp quills swept back that glow blue on movement. Speed, menace, precision incarnate.",
        abilities=["Ice Claws", "Lightning Dash", "Thunder Strike", "Storm Analysis", "Frozen Precision"]
    ),
    CharacterData(
        id="kaijax",
        name="KAI-JAX",
        title="The Memory King",
        description="The legendary fusion - split palette of ember gold/orange (Kai side) and electric blue (Jax side). Heterochromia eyes - one green, one gold. THREE TAILS: Tail 1 (flame/amber), Tail 2 (ice/blue), Tail 3 (bond tail - neutral dark, reacts to emotion). Evolves up to 9 tails. Only 1-2 tails glow at a time. At the 9th tail, BOTH fathers' echoes appear and crown him together.",
        abilities=["Dual Element Mastery", "Fusion State", "Nine-Tail Evolution", "Memory Weave", "Architect's Denial", "Sovereign Crown"]
    ),
    CharacterData(
        id="boryn",
        name="BORYN",
        title="The Shield Father",
        description="Foster father who raised Kai and Jax. Massive sabertooth tiger with bone white fur, charcoal accents, and cold pale gold eyes. Martial gi pants, shirtless warrior. Tall, lean, blade-like. Teaches survival through ruthless love. His sacrifice buys time for legends to be born. His ECHO returns at the 9th tail to crown Kai-Jax.",
        abilities=["Iron Defense", "Paternal Shield", "Sacrifice", "Lethal Precision", "Echo's Blessing"]
    ),
    CharacterData(
        id="borax",
        name="BORAX",
        title="The Sabertooth Law",
        description="Legendary apex mentor. Massive sabertooth lion with rust red, ash, and scorched iron palette. Apocalyptic militia armor, deep molten red eyes. Wide, immovable presence. Trains without comfort, never replaces the father. Teaches why survival needs restraint. His ECHO returns at the 9th tail to crown Kai-Jax alongside Boryn.",
        abilities=["Law Enforcement", "Discipline Strike", "Apex Judgment", "Silent Vigil", "Echo's Crown"]
    ),
]

STORY_ACTS = [
    StoryAct(
        act_number=1,
        title="SURVIVAL",
        subtitle="The City Teaches You to Bleed",
        region="Ashblock Heights",
        narrative="Kai & Jax survive street-level threats. Boryn protects, absorbs damage, fixes mistakes. Myth exists only as rumor and pressure. The act ends with Boryn's sacrifice and the Fusion Birth - tears hit the ground, an Elemental Memory Sphere forms, and Kai-Jax is born as the 3-Tail Memory Hero.",
        gameplay_goals=["Learn movement as survival", "Establish gravity and commitment", "Introduce pressure without explanation"],
        systems_introduced=["Core movement", "Basic combat", "Pre-fusion character switching", "Early Memory Flags", "First Fusion Event (3-Tail)"],
        boss_test="Fang Syndicate Enforcer - Tests impatience, punishes mashing",
        player_learns="Power doesn't save you. Positioning does."
    ),
    StoryAct(
        act_number=2,
        title="LAW",
        subtitle="Restraint Hurts More Than Hunger",
        region="Extended Ashblock & Fangforge Outskirts",
        narrative="Borax enters as pressure, not comfort. Fusion is denied repeatedly. The player learns discipline through loss. First hints of Design interference begin to surface.",
        gameplay_goals=["Learn restraint", "Learn denial", "Break greedy habits"],
        systems_introduced=["Fusion stability & denial", "Borax Law Field", "Enemy pattern adaptation", "Tail Slots expand to 4-5"],
        boss_test="Discipline-based elites that punish repetition",
        player_learns="Control without restraint becomes weakness."
    ),
    StoryAct(
        act_number=3,
        title="MEMORY",
        subtitle="The World Starts Forgetting",
        region="Veil Scar & Memory Grove",
        narrative="The Architect's influence becomes visible. NPCs forget names, places, events. Some NPCs vanish permanently. The player realizes death isn't the worst outcome - erasure is.",
        gameplay_goals=["Learn adaptation", "Force variation", "Make loss permanent"],
        systems_introduced=["Erasure (UI, mechanics, NPCs)", "Enemy learning escalation", "Memory Fragment collection", "Tail Slots expand to 6"],
        boss_test="Pattern recall fights and sensory-denial encounters",
        player_learns="Surviving doesn't mean you were remembered."
    ),
    StoryAct(
        act_number=4,
        title="ALIGNMENT",
        subtitle="You Choose What Carries Forward",
        region="Fangforge Wastes & Covenant Strongholds",
        narrative="The Void Fang Covenant is fully revealed. Synthetic apex predators are deployed. The Ninth Tail is actively being prevented. The player must choose sacrifice over efficiency.",
        gameplay_goals=["Test alignment", "Punish specialization", "Demand mastery without safety"],
        systems_introduced=["Advanced enemy adaptation", "Sacrifice Flags (irreversible)", "Tail Slots expand to 7-8", "Near-King states"],
        boss_test="Covenant Commanders - Regeneration, UI denial, full adaptation",
        player_learns="Winning the fight can still lose the future."
    ),
    StoryAct(
        act_number=5,
        title="SOVEREIGNTY",
        subtitle="Memory Refuses Erasure",
        region="Abyssal Engine",
        narrative="World-scale Design enforcement. Ulgorr's plan is fully active. Reality is rewritten in real time. The Ninth Tail manifests. Boryn's Spiritual Echo appears and crowns Kai-Jax. Memory Hero becomes Memory King.",
        gameplay_goals=["Prove coherence", "Survive without certainty", "Act decisively without panic"],
        systems_introduced=["Ninth Tail manifestation", "Memory King State (temporary)", "Overwrite Denial (once per activation)"],
        boss_test="Ulgorr the Fangless Architect - Environment fights, habit counters, UI fades",
        player_learns="Power ends things. Memory continues them."
    ),
]

SABERTOOTH_GODS = [
    {
        "name": "Kar-Voth",
        "domain": "Hunger / Initiation",
        "element": "Electric",
        "color": "#FFD60A",
        "description": "The First Hunter. He who taught the first predator to strike. His lightning ignites ambition."
    },
    {
        "name": "Thryxen",
        "domain": "Law / Sovereignty",
        "element": "Storm / Ice",
        "color": "#64D2FF",
        "description": "The Iron Law. She who decreed the rules of the hunt. Her storms cleanse the unworthy."
    },
    {
        "name": "Pyraxis",
        "domain": "Sacrifice / Endurance",
        "element": "Fire",
        "color": "#FF3B30",
        "description": "The Burning Will. He who proved that pain is the path to power. His flames forge legends."
    },
    {
        "name": "Myrr'Kai",
        "domain": "Memory / Adaptation",
        "element": "Web / Void",
        "color": "#BF5AF2",
        "description": "The Silent Weaver. She who remembers all that was erased. Her web connects all timelines."
    }
]

WORLD_REGIONS = [
    {
        "name": "Ashblock Heights",
        "description": "Rooftops, fire escapes, survival. Where legends are born from nothing.",
        "danger_level": "Moderate",
        "primary_enemies": ["Fang Syndicate", "Street Hunters"]
    },
    {
        "name": "Fangforge Wastes",
        "description": "Bone refineries, synthetic beasts. Where the Covenant builds their army.",
        "danger_level": "High",
        "primary_enemies": ["Synthetic Predators", "Covenant Forces"]
    },
    {
        "name": "Veil Scar",
        "description": "Broken time, unstable physics. Reality bleeds here.",
        "danger_level": "Extreme",
        "primary_enemies": ["Temporal Anomalies", "Memory Ghosts"]
    },
    {
        "name": "Memory Grove",
        "description": "Lost names, ancestral echoes. Where the forgotten wait to be remembered.",
        "danger_level": "Variable",
        "primary_enemies": ["Erasure Agents", "Lost Souls"]
    },
    {
        "name": "Abyssal Engine",
        "description": "Living machinery, endgame war. Ulgorr's throne of Design.",
        "danger_level": "Lethal",
        "primary_enemies": ["Ulgorr's Elite", "Design Constructs"]
    }
]

# ========== API ENDPOINTS ==========

@api_router.get("/tails", response_model=List[TailData])
async def get_tails():
    """Get all 9 tail data"""
    return TAILS_DATA

@api_router.get("/tails/{tail_id}", response_model=TailData)
async def get_tail(tail_id: int):
    """Get specific tail by ID"""
    for tail in TAILS_DATA:
        if tail.id == tail_id:
            return tail
    raise HTTPException(status_code=404, detail="Tail not found")

@api_router.get("/characters", response_model=List[CharacterData])
async def get_characters():
    """Get all character data"""
    return CHARACTERS_DATA

@api_router.get("/characters/{character_id}", response_model=CharacterData)
async def get_character(character_id: str):
    """Get specific character by ID"""
    for char in CHARACTERS_DATA:
        if char.id == character_id:
            return char
    raise HTTPException(status_code=404, detail="Character not found")

@api_router.get("/story")
async def get_story_acts():
    """Get all story acts"""
    return [act.model_dump() for act in STORY_ACTS]

@api_router.get("/story/{act_number}")
async def get_story_act(act_number: int):
    """Get specific story act"""
    for act in STORY_ACTS:
        if act.act_number == act_number:
            return act.model_dump()
    raise HTTPException(status_code=404, detail="Act not found")

@api_router.get("/gods")
async def get_sabertooth_gods():
    """Get the four Sabertooth Gods"""
    return SABERTOOTH_GODS

@api_router.get("/regions")
async def get_world_regions():
    """Get all world regions"""
    return WORLD_REGIONS

@api_router.get("/bible")
async def get_full_bible():
    """Get the complete game bible"""
    return {
        "title": "LEGENDS OF KAI-JAX: THE MEMORY KING",
        "tagline": "Forged in the Raging City. Crowned by Memory.",
        "franchise_pillar": "Survival without memory is extinction with better design.",
        "genre": ["Open-World Action RPG", "Narrative-Driven Brawler", "Mythic Urban Fantasy"],
        "tone": ["Brutal but hopeful", "Mythic, not cartoonish", "Emotional weight without melodrama", "Bronx-honest myth"],
        "player_fantasy": "You are not becoming stronger. You are learning what deserves to survive.",
        "tails": [t.model_dump() for t in TAILS_DATA],
        "characters": [c.model_dump() for c in CHARACTERS_DATA],
        "story_acts": [a.model_dump() for a in STORY_ACTS],
        "gods": SABERTOOTH_GODS,
        "regions": WORLD_REGIONS,
        "coronation": {
            "trigger": "When alignment is complete",
            "events": [
                "The Ninth Tail manifests",
                "Boryn's Spiritual Echo appears",
                "He acknowledges and crowns Kai-Jax"
            ],
            "quote": "You carried what I couldn't.",
            "result": "Memory Hero → Memory King. A state change, not a buff."
        },
        "endgame_truth": "Kai-Jax does not win by domination. He wins because memory cannot be designed out of existence."
    }

# ========== AI IMAGE GENERATION ==========

@api_router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_character_image(request: ImageGenerationRequest):
    """Generate character image using AI"""
    from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    try:
        image_gen = OpenAIImageGeneration(api_key=api_key)
        images = await image_gen.generate_images(
            prompt=request.prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Save to database
            generated = GeneratedImage(
                character_type=request.character_type,
                prompt=request.prompt,
                image_base64=image_base64
            )
            doc = generated.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.generated_images.insert_one(doc)
            
            return ImageGenerationResponse(
                image_base64=image_base64,
                character_type=request.character_type,
                prompt=request.prompt
            )
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
    except Exception as e:
        logging.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@api_router.get("/generated-images/{character_type}")
async def get_generated_images(character_type: str):
    """Get previously generated images for a character type"""
    images = await db.generated_images.find(
        {"character_type": character_type}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    return images

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
