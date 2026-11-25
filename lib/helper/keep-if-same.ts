/**
 * A state update that keeps the current value when the new one has the same content,
 * so React skips the re-render. Used for refetched app data (settings, profile,
 * permissions) that usually comes back unchanged: replacing it with an equal copy
 * re-rendered the whole app and froze slow phones for a moment.
 */
export function keepIfSame<T>(next: T): (current: T) => T {
  const nextJson = JSON.stringify(next);
  return (current) => (JSON.stringify(current) === nextJson ? current : next);
}
