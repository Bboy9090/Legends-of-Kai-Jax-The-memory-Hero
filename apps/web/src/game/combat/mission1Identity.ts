/** Public and legacy routes for the single Mission 1 encounter. */
export function isMission1Id(id: string | null | undefined): boolean {
  return id === 'story_act1_m1' || id === 'mission1' || id === 'm1' || id === 'story_1';
}
