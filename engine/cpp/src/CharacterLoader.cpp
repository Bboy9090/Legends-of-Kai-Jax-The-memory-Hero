#include "../include/CharacterLoader.h"
#include <fstream>
#include <sstream>
#include <stdexcept>

using json = nlohmann::json;

namespace LegendsEngine {

std::unique_ptr<CharacterSpecification> CharacterLoader::loadFromFile(const std::string& filePath) {
        try {
            // Read JSON file
            std::ifstream file(filePath);
            if (!file.is_open()) {
                throw std::runtime_error("Failed to open file: " + filePath);
            }

            json jsonData;
            file >> jsonData;
            file.close();

            // Parse JSON into CharacterSpecification
            return loadFromJson(jsonData);
        }
        catch (const std::exception& e) {
            // Return invalid specification with error
            auto spec = std::make_unique<CharacterSpecification>();
            spec->valid = false;
            spec->validationError = std::string("Failed to load character: ") + e.what();
            return spec;
        }
    }

std::unique_ptr<CharacterSpecification> CharacterLoader::loadFromJson(const json& jsonData) {
        auto spec = std::make_unique<CharacterSpecification>();

        try {
            // Load metadata
            spec->characterId = jsonData.at("character_id").get<std::string>();
            spec->displayName = jsonData.at("display_name").get<std::string>();
            spec->title = jsonData.at("title").get<std::string>();
            spec->version = jsonData.at("version").get<std::string>();

            // Load authoritative reference
            loadAuthoritativeReference(jsonData.at("authoritative_reference"), spec->authoritativeReference);

            // Load anatomy (CRITICAL: Tail count validation)
            loadAnatomy(jsonData.at("anatomy"), spec->anatomy);

            // Load silhouette rules
            loadSilhouetteRules(jsonData.at("silhouette_rules"), spec->silhouetteRules);

            // Load modeling
            loadModeling(jsonData.at("modeling"), spec->modeling);

            // Load materials
            loadMaterials(jsonData.at("materials"), spec->materials);

            // Load rigging
            loadRigging(jsonData.at("rigging"), spec->rigging);

            // Load animation
            loadAnimation(jsonData.at("animation"), spec->animation);

            // Load animation spec with animation sets
            loadAnimationSpec(jsonData.at("animation"), spec->animationSpec);

            // Load combat identity
            loadCombatIdentity(jsonData.at("combat_identity"), spec->combatIdentity);

            // Load tail roles
            loadTailRoles(jsonData.at("tail_roles"), spec->tailRoles);

            // Load engine integration
            loadEngineIntegration(jsonData.at("engine_integration"), spec->engineIntegration);

            // Load mobile profile
            loadMobileProfile(jsonData.at("mobile_profile"), spec->mobileProfile);

            // Load acceptance criteria
            loadAcceptanceCriteria(jsonData.at("acceptance_criteria"), spec->acceptanceCriteria);

            // CRITICAL VALIDATION: Tail count consistency
            validateTailCount(spec.get());

            // Mark as valid
            spec->valid = true;
        }
        catch (const std::exception& e) {
            spec->valid = false;
            spec->validationError = std::string("JSON parsing error: ") + e.what();
        }

        return spec;
    }

void CharacterLoader::loadAuthoritativeReference(const json& j, AuthoritativeReference& ref) {
        ref.type = j.at("type").get<std::string>();
        ref.rule = j.at("rule").get<std::string>();
        ref.notes = j.at("notes").get<std::string>();
    }

void CharacterLoader::loadAnatomy(const json& j, Anatomy& anatomy) {
        anatomy.speciesComposite = j.at("species_composite").get<std::vector<std::string>>();
        anatomy.bodyType = j.at("body_type").get<std::string>();
        anatomy.heightMultiplier = j.at("height_multiplier").get<float>();
        anatomy.build = j.at("build").get<std::string>();
        anatomy.legs = j.at("legs").get<std::string>();
        anatomy.hands = j.at("hands").get<std::string>();
        anatomy.head = j.at("head").get<std::string>();
        anatomy.spine = j.at("spine").get<std::string>();
        anatomy.tailCount = j.at("tail_count").get<int>();
    }

void CharacterLoader::loadSilhouetteRules(const json& j, SilhouetteRules& rules) {
        rules.readableInShadow = j.at("readable_in_shadow").get<bool>();
        rules.noMascotProportions = j.at("no_mascot_proportions").get<bool>();
        rules.noCapeSubstitution = j.at("no_cape_substitution").get<bool>();
        rules.tailsMustArc = j.at("tails_must_arc").get<std::string>();
        rules.antiDerivativeEnforced = j.at("anti_derivative_enforced").get<bool>();
    }

void CharacterLoader::loadModeling(const json& j, Modeling& modeling) {
        modeling.units = j.at("units").get<std::string>();
        modeling.scale = j.at("scale").get<float>();
        modeling.topology = j.at("topology").get<std::string>();
        
        // Load LOD targets
        const auto& lodTargets = j.at("lod_targets");
        for (auto it = lodTargets.begin(); it != lodTargets.end(); ++it) {
            LODTarget target;
            const auto& triangleRange = it.value().at("triangles");
            target.minTriangles = triangleRange[0].get<int>();
            target.maxTriangles = triangleRange[1].get<int>();
            modeling.lodTargets[it.key()] = target;
        }

        modeling.edgeLoopsRequired = j.at("edge_loops_required").get<std::vector<std::string>>();
    }

void CharacterLoader::loadMaterials(const json& j, Materials& materials) {
        // Load fur material
        const auto& fur = j.at("fur");
        materials.fur.type = fur.at("type").get<std::string>();
        materials.fur.pbr = fur.at("pbr").get<bool>();
        materials.fur.maps = fur.at("maps").get<std::vector<std::string>>();
        materials.fur.notes = fur.at("notes").get<std::string>();

        // Load skin material
        const auto& skin = j.at("skin");
        materials.skin.pbr = skin.at("pbr").get<bool>();
        materials.skin.subsurfaceScattering = skin.at("subsurface_scattering").get<bool>();

        // Load armor material
        const auto& armor = j.at("armor");
        materials.armor.material = armor.at("material").get<std::string>();
        const auto& roughnessRange = armor.at("roughness_range");
        materials.armor.roughnessRange[0] = roughnessRange[0].get<float>();
        materials.armor.roughnessRange[1] = roughnessRange[1].get<float>();
        materials.armor.edgeWear = armor.at("edge_wear").get<bool>();
        materials.armor.cleanSurfacesDisallowed = armor.at("clean_surfaces_disallowed").get<bool>();

        // Load spikes material
        const auto& spikes = j.at("spikes");
        materials.spikes.material = spikes.at("material").get<std::string>();
        // Handle emissive field which can be boolean or string ("subtle_event_only")
        const auto& spikesEmissive = spikes.at("emissive");
        if (spikesEmissive.is_boolean()) {
            materials.spikes.emissive = spikesEmissive.get<bool>();
        } else if (spikesEmissive.is_string()) {
            // String values like "subtle_event_only" are considered true/enabled
            materials.spikes.emissive = true;
        } else {
            materials.spikes.emissive = false;
        }

        // Load weave energy material
        const auto& weaveEnergy = j.at("weave_energy");
        materials.weaveEnergy.emissive = weaveEnergy.at("emissive").get<bool>();
        materials.weaveEnergy.alwaysOn = weaveEnergy.at("always_on").get<bool>();
        materials.weaveEnergy.mobileDisabled = weaveEnergy.at("mobile_disabled").get<bool>();
    }

void CharacterLoader::loadRigging(const json& j, Rigging& rigging) {
        rigging.skeletonType = j.at("skeleton_type").get<std::string>();
        rigging.singleSkeletonOnly = j.at("single_skeleton_only").get<bool>();

        // Load extra bones
        const auto& extraBones = j.at("extra_bones");
        
        // Load tail specifications
        const auto& tails = extraBones.at("tails");
        rigging.extraBones.tails.count = tails.at("count").get<int>();
        const auto& bonesPerTail = tails.at("bones_per_tail");
        rigging.extraBones.tails.minBonesPerTail = bonesPerTail[0].get<int>();
        rigging.extraBones.tails.maxBonesPerTail = bonesPerTail[1].get<int>();
        rigging.extraBones.tails.physicsEnabled = tails.at("physics_enabled").get<bool>();

        // Load tail constraints
        const auto& constraints = tails.at("constraints");
        rigging.extraBones.tails.constraints.swingLimit = constraints.at("swing_limit").get<bool>();
        rigging.extraBones.tails.constraints.twistLimit = constraints.at("twist_limit").get<bool>();
        rigging.extraBones.tails.constraints.noodlePhysics = constraints.at("noodle_physics").get<bool>();

        rigging.extraBones.spineDeformation = extraBones.at("spine_deformation").get<bool>();
        rigging.extraBones.jaw = extraBones.at("jaw").get<bool>();
        rigging.extraBones.ears = extraBones.at("ears").get<bool>();

        // Load facial system
        const auto& facialSystem = j.at("facial_system");
        rigging.facialSystem.type = facialSystem.at("type").get<std::string>();
        rigging.facialSystem.required = facialSystem.at("required").get<std::vector<std::string>>();
        rigging.facialSystem.animeExaggeration = facialSystem.at("anime_exaggeration").get<bool>();
    }

void CharacterLoader::loadAnimation(const json& j, Animation& animation) {
        animation.philosophy = j.at("philosophy").get<std::string>();
        animation.noFloatyMotion = j.at("no_floaty_motion").get<bool>();
        animation.rootMotionOnlyFor = j.at("root_motion_only_for").get<std::vector<std::string>>();
        animation.requiredSets = j.at("required_sets").get<std::vector<std::string>>();

        // Load frame rules
        const auto& frameRules = j.at("frame_rules");
        animation.frameRules.minFramesPerAction = frameRules.at("min_frames_per_action").get<int>();
        animation.frameRules.cancelRules = frameRules.at("cancel_rules").get<std::string>();
    }

void CharacterLoader::loadAnimationSpec(const json& j, AnimationSpec& animationSpec) {
        // Load base animation data
        animationSpec.philosophy = j.at("philosophy").get<std::string>();
        animationSpec.noFloatyMotion = j.at("no_floaty_motion").get<bool>();
        animationSpec.rootMotionOnlyFor = j.at("root_motion_only_for").get<std::vector<std::string>>();
        animationSpec.requiredSets = j.at("required_sets").get<std::vector<std::string>>();

        // Load frame rules
        const auto& frameRules = j.at("frame_rules");
        animationSpec.frameRules.minFramesPerAction = frameRules.at("min_frames_per_action").get<int>();
        animationSpec.frameRules.cancelRules = frameRules.at("cancel_rules").get<std::string>();

        // Generate animation sets from required_sets
        // Create placeholder paths for each required animation set
        for (const auto& setName : animationSpec.requiredSets) {
            AnimationSet animSet;
            animSet.name = setName;
            // Generate path based on animation set name
            // Format: ./assets/anims/kai_jax_<set_name>.anim
            animSet.path = "./assets/anims/kai_jax_" + setName + ".anim";
            animationSpec.sets.push_back(animSet);
        }
    }

void CharacterLoader::loadCombatIdentity(const json& j, CombatIdentity& combat) {
        combat.role = j.at("role").get<std::string>();
        combat.scalesFrom = j.at("scales_from").get<std::string>();
        combat.scalesTo = j.at("scales_to").get<std::string>();
        combat.strengths = j.at("strengths").get<std::vector<std::string>>();
        combat.weaknesses = j.at("weaknesses").get<std::vector<std::string>>();
    }

void CharacterLoader::loadTailRoles(const json& j, std::vector<TailRole>& tailRoles) {
        tailRoles.clear();
        for (const auto& tailJson : j) {
            TailRole role;
            role.index = tailJson.at("index").get<int>();
            role.name = tailJson.at("name").get<std::string>();
            role.function = tailJson.at("function").get<std::string>();
            tailRoles.push_back(role);
        }
    }

void CharacterLoader::loadEngineIntegration(const json& j, EngineIntegration& engine) {
        engine.renderer = j.at("renderer").get<std::string>();
        engine.gpuSkinning = j.at("gpu_skinning").get<bool>();
        engine.physicsBonesEnabled = j.at("physics_bones").get<bool>();
        engine.lodSystem = j.at("lod_system").get<bool>();
        engine.eventDrivenVfx = j.at("event_driven_vfx").get<bool>();

        // Load lighting
        const auto& lighting = j.at("lighting");
        engine.lighting.noBakedCharacterLighting = lighting.at("no_baked_character_lighting").get<bool>();
        engine.lighting.validationLighting = lighting.at("validation_lighting").get<std::string>();
    }

void CharacterLoader::loadMobileProfile(const json& j, MobileProfile& profile) {
        profile.allowedCuts = j.at("allowed_cuts").get<std::vector<std::string>>();
        profile.neverCut = j.at("never_cut").get<std::vector<std::string>>();
    }

void CharacterLoader::loadAcceptanceCriteria(const json& j, AcceptanceCriteria& criteria) {
        criteria.silhouetteMatch = j.at("silhouette_match").get<bool>();
        criteria.tailIndependenceVisible = j.at("tail_independence_visible").get<bool>();
        criteria.armorReadsWorn = j.at("armor_reads_worn").get<bool>();
        criteria.idleFeelsDangerous = j.at("idle_feels_dangerous").get<bool>();
        criteria.combatWeightPreserved = j.at("combat_weight_preserved").get<bool>();
    }

void CharacterLoader::validateTailCount(CharacterSpecification* spec) {
        const int anatomyTailCount = spec->anatomy.tailCount;
        const int riggingTailCount = spec->rigging.extraBones.tails.count;
        const int tailRolesCount = static_cast<int>(spec->tailRoles.size());

        // Check consistency across all tail-related fields
        if (anatomyTailCount != riggingTailCount || anatomyTailCount != tailRolesCount) {
            std::ostringstream error;
            error << "Tail count mismatch - anatomy: " << anatomyTailCount
                  << ", rigging: " << riggingTailCount
                  << ", tail_roles: " << tailRolesCount;
            throw std::runtime_error(error.str());
        }

        // LOCKFILE REQUIREMENT: Kai-Jax must have exactly 9 tails
        if (spec->characterId == "kai_jax" && anatomyTailCount != 9) {
            std::ostringstream error;
            error << "LOCKFILE VIOLATION: Kai-Jax must have exactly 9 tails, got " << anatomyTailCount;
            throw std::runtime_error(error.str());
        }

        // Validate tail roles have sequential indices from 1 to N
        for (size_t i = 0; i < spec->tailRoles.size(); ++i) {
            if (spec->tailRoles[i].index != static_cast<int>(i + 1)) {
                std::ostringstream error;
                error << "Tail role index mismatch at position " << i
                      << ": expected " << (i + 1)
                      << ", got " << spec->tailRoles[i].index;
                throw std::runtime_error(error.str());
            }
        }
    }

} // namespace LegendsEngine
