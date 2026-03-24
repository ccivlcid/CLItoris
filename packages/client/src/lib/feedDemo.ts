/** Client-only demo posts when the global feed API returns []. IDs are not in the DB. */
export function isFeedDemoPostId(id: string): boolean {
  return id.startsWith('mock-');
}
