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

# ========== GAME LORE DATA ==========

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
        title="The Web Weaver",
        description="The elder brother - a fiery orange and blackish-grey hedgehog-fox beast with spiky fur heavy on top and athletic build. Always playing with his webs - shooting graffiti tags, creating hammocks, hanging upside down. His webs can pull, push, slam, dodge, and channel electricity, ice, or fire through them. Wears his signature jacket everywhere.",
        abilities=["Web Shot", "Electric Web", "Fire Web", "Ice Web", "Graffiti Tag", "Web Slam", "Hammock Hang"]
    ),
    CharacterData(
        id="jax",
        name="JAX",
        title="The Storm Fox",
        description="The younger brother - a sleek silver-blue fox beast with a magnificent fluffy tail. Cool, calculated, always three moves ahead. Ice and lightning crackle around him. Where Kai is chaos, Jax is precision. His frost patterns shift with his mood.",
        abilities=["Storm Strike", "Ice Shard", "Lightning Dash", "Frost Shield", "Thunder Clap"]
    ),
    CharacterData(
        id="kaijax",
        name="KAI-JAX",
        title="The Memory King",
        description="The legendary fusion - a towering dark shadowy beast with glowing yellow eyes that pierce through reality. Nine magnificent elemental tails swirl behind him - fire, lightning, ice, void, earth, water, nature, light, and memory. Armored in battle-worn gear, he embodies the combined power of two brothers. Neither Kai nor Jax - something far greater. The beast who cannot be erased.",
        abilities=["Nine-Tail Mastery", "Memory Weave", "Fusion State", "Architect's Denial", "Sovereign Crown", "Reality Warp"]
    ),
    CharacterData(
        id="boryn",
        name="BORYN",
        title="The Shield's Warmth",
        description="A massive protective tiger beast - the foster father who raised Kai and Jax on the streets. Warm amber eyes, battle-worn orange fur, sits watch while the brothers train and play. His presence means safety. His sacrifice bought time for legends to be born.",
        abilities=["Iron Defense", "Paternal Shield", "Sacrifice", "Warm Embrace"]
    ),
    CharacterData(
        id="borax",
        name="BORAX",
        title="The Mentor's Vigil",
        description="A TOWERING armored lion warrior - the apex Sabertooth who watches from the shadows of the cyberpunk city. Ancient battle armor covers his massive frame. Cold, distant, but always watching. He is the Law itself. His presence makes even the bravest hesitate.",
        abilities=["Law Enforcement", "Discipline Strike", "Apex Judgment", "Silent Vigil", "Iron Will"]
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
