import StoryHubScreen from "./StoryHubScreen";

/**
 * Compatibility route for older saves/navigation that still target
 * `campaign-map`.
 *
 * The previous implementation read the deprecated Cross Point / Rift campaign
 * data from story_missions.ts and therefore could expose non-Bloodward story
 * events. Until current publication-locked missions are authored, route the
 * legacy state into the canonical Raging City Story Hub instead of presenting
 * stale chronology as playable story.
 */
export default function CampaignMap() {
  return <StoryHubScreen />;
}
