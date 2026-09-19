import StoryHubScreen from "./StoryHubScreen";

/**
 * Compatibility route for the older district-select state.
 *
 * The former screen consumed legacy encounter tables, score/currency rewards,
 * and campaign-node assumptions that are not yet certified against Bloodward.
 * Keep old navigation working, but resolve it into the publication-safe Raging
 * City Story Hub until the district encounter ledger is rebuilt from current
 * canon.
 */
export default function DistrictSelectScreen() {
  return <StoryHubScreen />;
}
