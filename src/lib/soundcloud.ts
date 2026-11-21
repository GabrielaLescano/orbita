const SOUNDCLOUD_URL = /^https:\/\/(?:www\.)?soundcloud\.com\/[\w-]+\/[\w-]+\/?(?:\?.*)?$/i;

export type SoundcloudMetadata = { title: string; artist: string };

/** Solo acepta links directos a un tema (usuario/tema), no perfiles ni playlists sueltas. */
export function isValidSoundcloudUrl(url: string): boolean {
  return SOUNDCLOUD_URL.test(url.trim());
}

export async function fetchSoundcloudMetadata(url: string): Promise<SoundcloudMetadata | null> {
  const endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  } catch (err) {
    console.error("[fetchSoundcloudMetadata] no se pudo contactar a SoundCloud", err);
    return null;
  }
  if (!response.ok) return null;

  const data: unknown = await response.json().catch(() => null);
  if (!data || typeof data !== "object") return null;

  const title = "title" in data && typeof data.title === "string" ? data.title : null;
  const artist = "author_name" in data && typeof data.author_name === "string" ? data.author_name : null;
  if (!title) return null;

  return { title, artist: artist ?? "SoundCloud" };
}
