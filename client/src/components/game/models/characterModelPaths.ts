/**
 * OMEGA PROTOCOL: CHARACTER MODEL PATHS
 * 
 * Beast-Kin original characters with legendary beast designs
 * Not blocks, not shapes, not sticks - real life beast-like fighters
 */
export const CHARACTER_MODEL_PATHS: Record<string, string> = {
  // === AXIS TRINITY (Main Protagonists) ===
  'jaxon': '/models/jaxon_hero.glb',           // Beastly Hedgehog-Lupine Hybrid - Velocity Fracture
  'kaison': '/models/kaison_hero.glb',         // Saiyan-Kitsune-Lupine - Star-Force Tactician
  'kai-jax': '/models/kaxon_hero.glb',         // Star-Slime Chimera - Memory King (Fused Form)
  'kai_jax': '/models/kaxon_hero.glb',
  'kaxon': '/models/kaxon_hero.glb',
  'chronos': '/models/silver_hero.glb',        // Matte-White Lupine - Will of Tomorrow
  'chronos_sere': '/models/silver_hero.glb',
  'lunara': '/models/lunara_hero.glb',         // 9-tailed Celestial Feline-Avian - Oracle Sentinel
  'lunara_solis': '/models/lunara_hero.glb',
  
  // === VANGUARD (Heavy Hitters) ===
  'boryx': '/models/bowser_hero.glb',          // Draconic Ursine - Guardian King
  'boryx_zenith': '/models/bowser_hero.glb',
  'umbra': '/models/abyss_hero.glb',           // Celestial Lupine - Velocity Wraith
  'umbra_flux': '/models/abyss_hero.glb',
  'umbra-flux': '/models/abyss_hero.glb',
  'vox': '/models/fox_hero.glb',               // Saiyan-Kitsune - Star-Force Pilot
  'sentinel_vox': '/models/sentinel_hero.glb',
  'kiro': '/models/kong_hero.glb',             // Augmented Ape-Kin - Primal Breaker
  'kiro_kong': '/models/kong_hero.glb',
  
  // === LEGACY ADAPTATIONS ===
  'mario': '/models/mario_hero.glb',
  'sonic': '/models/velocity_hero.glb',
  'velocity': '/models/velocity_hero.glb',
  'link': '/models/ren_hero.glb',
  'ren': '/models/ren_hero.glb',
  'kirby': '/models/puffy_hero.glb',
  'puffy': '/models/puffy_hero.glb',
  'megaman': '/models/blaze_hero.glb',
  'blaze': '/models/blaze_hero.glb',
  'samus': '/models/sentinel_hero.glb',
  'sentinel': '/models/sentinel_hero.glb',
  'donkeykong': '/models/kong_hero.glb',
  'kong': '/models/kong_hero.glb',
  'pikachu': '/models/sparky_hero.glb',
  'sparky': '/models/sparky_hero.glb',
  'bowser': '/models/bowser_hero.glb',
  'zelda': '/models/zelda_hero.glb',
  'peach': '/models/peach_hero.glb',
  'fox': '/models/fox_hero.glb',
  'captain_falcon': '/models/apex_hero.glb',
  'apex': '/models/apex_hero.glb',
  'shadow': '/models/abyss_hero.glb',
  'abyss': '/models/abyss_hero.glb',
  'yoshi': '/models/yoshi_hero.glb',
  'luigi': '/models/luigi_hero.glb',
  'tails': '/models/tails_hero.glb',
  'falco': '/models/falco_hero.glb',
  'rosalina': '/models/rosalina_hero.glb',
  'impa': '/models/impa_hero.glb',
  'palutena': '/models/palutena_hero.glb',
  'ash': '/models/ash_hero.glb',
  'greninja': '/models/greninja_hero.glb',
  'snake': '/models/snake_hero.glb',
  'bayonetta': '/models/bayonetta_hero.glb',
  'ryu': '/models/ryu_hero.glb',
  'silver': '/models/silver_hero.glb',
  'solaro': '/models/solaro_hero.glb',
  'diddy': '/models/diddy_hero.glb',
  'terry': '/models/terry_hero.glb',
  'pit': '/models/pit_hero.glb',
  'marth': '/models/marth_hero.glb',
  'cloud': '/models/cloud_hero.glb',
  'metaknight': '/models/metaknight_hero.glb',
  'meta_knight': '/models/metaknight_hero.glb',
  'wario': '/models/wario_hero.glb',
  'ness': '/models/ness_hero.glb',
  'mewtwo': '/models/mewtwo_hero.glb',
  'ken': '/models/ken_hero.glb',
  'chunli': '/models/chunli_hero.glb',
  'chun_li': '/models/chunli_hero.glb',
  'simon': '/models/simon_hero.glb',
  'lucario': '/models/lucario_hero.glb',
  'sephiroth': '/models/sephiroth_hero.glb',
  'iceclimbers': '/models/iceclimbers_hero.glb',
  'ice_climbers': '/models/iceclimbers_hero.glb',
  'inkling': '/models/inkling_hero.glb',
  'pacman': '/models/pacman_hero.glb',
  'pac_man': '/models/pacman_hero.glb',
  'dedede': '/models/dedede_hero.glb',
  'king_dedede': '/models/dedede_hero.glb',
  'ridley': '/models/ridley_hero.glb',
  'joker': '/models/joker_hero.glb',
  'hero': '/models/hero_hero.glb',
  'banjo': '/models/banjo_hero.glb',
  'banjo_kazooie': '/models/banjo_hero.glb',
  'minmin': '/models/minmin_hero.glb',
  'min_min': '/models/minmin_hero.glb',
  'steve': '/models/steve_hero.glb',
  'kazuya': '/models/kazuya_hero.glb',
  'sora': '/models/sora_hero.glb',
  'pyra': '/models/pyra_hero.glb',
  'mythra': '/models/pyra_hero.glb',
  'waluigi': '/models/waluigi_hero.glb',
  'littlemac': '/models/littlemac_hero.glb',
  'little_mac': '/models/littlemac_hero.glb',
  'shulk': '/models/shulk_hero.glb',
};

export function hasGLBModel(characterId: string): boolean {
  return characterId in CHARACTER_MODEL_PATHS;
}

export function getModelPath(characterId: string): string | null {
  return CHARACTER_MODEL_PATHS[characterId] || null;
}
