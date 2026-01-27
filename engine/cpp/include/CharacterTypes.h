#pragma once

#include <string>
#include <vector>
#include <array>
#include <map>

namespace LegendsEngine {

// Anatomy data structures
struct Anatomy {
    std::vector<std::string> speciesComposite;
    std::string bodyType;
    float heightMultiplier;
    std::string build;
    std::string legs;
    std::string hands;
    std::string head;
    std::string spine;
    int tailCount;  // CRITICAL: Must be 9 for Kai-Jax
};

// Silhouette rules
struct SilhouetteRules {
    bool readableInShadow;
    bool noMascotProportions;
    bool noCapeSubstitution;
    std::string tailsMustArc;
    bool antiDerivativeEnforced;
};

// LOD target
struct LODTarget {
    int minTriangles;
    int maxTriangles;
};

// Modeling specifications
struct Modeling {
    std::string units;
    float scale;
    std::string topology;
    std::map<std::string, LODTarget> lodTargets;
    std::vector<std::string> edgeLoopsRequired;
};

// Material specifications
struct MaterialSpec {
    std::string type;
    bool pbr;
    std::vector<std::string> maps;
    std::string notes;
    bool subsurfaceScattering;
    std::string material;
    std::array<float, 2> roughnessRange;
    bool edgeWear;
    bool cleanSurfacesDisallowed;
    bool emissive;
    bool alwaysOn;
    bool mobileDisabled;
};

struct Materials {
    MaterialSpec fur;
    MaterialSpec skin;
    MaterialSpec armor;
    MaterialSpec spikes;
    MaterialSpec weaveEnergy;
};

// Tail constraints
struct TailConstraints {
    bool swingLimit;
    bool twistLimit;
    bool noodlePhysics;
};

// Tail specifications
struct TailSpec {
    int count;
    int minBonesPerTail;
    int maxBonesPerTail;
    bool physicsEnabled;
    TailConstraints constraints;
};

// Extra bones specifications
struct ExtraBones {
    TailSpec tails;
    bool spineDeformation;
    bool jaw;
    bool ears;
};

// Facial system
struct FacialSystem {
    std::string type;
    std::vector<std::string> required;
    bool animeExaggeration;
};

// Rigging specifications
struct Rigging {
    std::string skeletonType;
    bool singleSkeletonOnly;
    ExtraBones extraBones;
    FacialSystem facialSystem;
};

// Frame rules
struct FrameRules {
    int minFramesPerAction;
    std::string cancelRules;
};

// Animation set - represents a single animation with name and path
struct AnimationSet {
    std::string name;  // e.g., "idle_calm", "walk", "run"
    std::string path;  // e.g., "./assets/anims/kai_jax_idle_calm.anim"
};

// Animation specifications - includes both metadata and animation sets
struct AnimationSpec {
    std::string philosophy;
    bool noFloatyMotion;
    std::vector<std::string> rootMotionOnlyFor;
    std::vector<std::string> requiredSets;
    FrameRules frameRules;
    std::vector<AnimationSet> sets;  // Actual animation file paths
};

// Legacy Animation structure for backward compatibility
struct Animation {
    std::string philosophy;
    bool noFloatyMotion;
    std::vector<std::string> rootMotionOnlyFor;
    std::vector<std::string> requiredSets;
    FrameRules frameRules;
};

// Combat identity
struct CombatIdentity {
    std::string role;
    std::string scalesFrom;
    std::string scalesTo;
    std::vector<std::string> strengths;
    std::vector<std::string> weaknesses;
};

// Tail role
struct TailRole {
    int index;
    std::string name;
    std::string function;
};

// Engine integration
struct Lighting {
    bool noBakedCharacterLighting;
    std::string validationLighting;
};

struct EngineIntegration {
    std::string renderer;
    bool gpuSkinning;
    bool physicsBonesEnabled;
    bool lodSystem;
    bool eventDrivenVfx;
    Lighting lighting;
};

// Mobile profile
struct MobileProfile {
    std::vector<std::string> allowedCuts;
    std::vector<std::string> neverCut;
};

// Acceptance criteria
struct AcceptanceCriteria {
    bool silhouetteMatch;
    bool tailIndependenceVisible;
    bool armorReadsWorn;
    bool idleFeelsDangerous;
    bool combatWeightPreserved;
};

// Authoritative reference
struct AuthoritativeReference {
    std::string type;
    std::string rule;
    std::string notes;
};

} // namespace LegendsEngine
