/** Optional embedded assets make the review artifact runnable without a server. */
export function assetURL(path: string): string {
  const embedded = (
    window as Window & {
      solariaArtAssets?: Record<string, string>;
    }
  ).solariaArtAssets;
  return embedded?.[path] ?? `${import.meta.env.BASE_URL}${path}`;
}
