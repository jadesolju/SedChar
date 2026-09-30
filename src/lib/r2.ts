import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'sedchar-uploads';
export const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-399344a22b054540abd5d381354ce511.r2.dev').replace(/\/+$/, '');

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_S3_API || `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Uploads a character JSON payload to Cloudflare R2
 * Returns the public CDN URL
 */
export async function uploadCharacterPayloadToR2(characterId: string, payload: any): Promise<string> {
  const key = `characters/${characterId}.json`;
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Uploads a public share payload to Cloudflare R2
 */
export async function uploadSharePayloadToR2(shareId: string, payload: any): Promise<string> {
  const key = `shares/${shareId}.json`;
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=86400, stale-while-revalidate=604800',
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Reads a character JSON payload from R2 (via CDN or direct S3 API fallback)
 */
export async function fetchCharacterPayloadFromR2(characterId: string): Promise<any | null> {
  // 1. Try fetching via Public CDN (Fastest, Edge-cached)
  const cdnUrl = `${R2_PUBLIC_URL}/characters/${characterId}.json`;
  try {
    const res = await fetch(cdnUrl, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback to direct S3 GetObject
  }

  // 2. Direct S3 GetObject Fallback
  try {
    const getRes = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `characters/${characterId}.json`,
      })
    );
    const bodyStr = await getRes.Body?.transformToString();
    if (bodyStr) {
      return JSON.parse(bodyStr);
    }
  } catch (err) {
    console.warn('R2 GetObject error for character:', characterId, err);
  }

  return null;
}

/**
 * Deletes a character JSON payload from Cloudflare R2
 */
export async function deleteCharacterPayloadFromR2(characterId: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `characters/${characterId}.json`,
      })
    );
  } catch (err) {
    console.warn('R2 Delete error for character:', characterId, err);
  }
}

/**
 * Uploads a public community prompt to Cloudflare R2
 */
export async function uploadCommunityPromptToR2(promptId: string, payload: any): Promise<string> {
  const key = `prompts/${promptId}.json`;
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=3600, stale-while-revalidate=86400',
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Fetches the community prompts list from Cloudflare R2
 */
export async function fetchCommunityPromptsIndexFromR2(): Promise<any[] | null> {
  const key = 'prompts/community_index.json';
  const cdnUrl = `${R2_PUBLIC_URL}/${key}`;
  
  // 1. Try public CDN fast-path
  try {
    const res = await fetch(cdnUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  // 2. Direct S3 GetObject fallback
  try {
    const getRes = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    const bodyStr = await getRes.Body?.transformToString();
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // File may not exist yet on first run
  }

  return null;
}

/**
 * Saves and updates the community prompts index in Cloudflare R2
 */
export async function saveCommunityPromptToIndexInR2(newPrompt: any): Promise<void> {
  const key = 'prompts/community_index.json';
  
  // Fetch existing index
  let existing: any[] = [];
  try {
    const fetched = await fetchCommunityPromptsIndexFromR2();
    if (Array.isArray(fetched)) {
      existing = fetched;
    }
  } catch {}

  // Filter out any duplicate with same ID, prepend new prompt
  const updated = [newPrompt, ...existing.filter((p) => p.id !== newPrompt.id)];

  // Save to R2
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(updated, null, 2),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=60, stale-while-revalidate=86400',
    })
  );
}

/**
 * Deletes a prompt from the community index in Cloudflare R2
 */
export async function deleteCommunityPromptFromIndexInR2(promptId: string): Promise<void> {
  const key = 'prompts/community_index.json';
  
  let existing: any[] = [];
  try {
    const fetched = await fetchCommunityPromptsIndexFromR2();
    if (Array.isArray(fetched)) {
      existing = fetched;
    }
  } catch {}

  const updated = existing.filter((p) => p.id !== promptId);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(updated, null, 2),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=60, stale-while-revalidate=86400',
    })
  );
}

/**
 * Increments or decrements the likes count of a prompt in Cloudflare R2 index
 */
export async function likeCommunityPromptInR2(promptId: string, delta: number = 1): Promise<number> {
  const key = 'prompts/community_index.json';
  let existing: any[] = [];
  try {
    const fetched = await fetchCommunityPromptsIndexFromR2();
    if (Array.isArray(fetched)) {
      existing = fetched;
    }
  } catch {}

  let newLikes = 1;
  const updated = existing.map((p) => {
    if (p.id === promptId) {
      const count = Math.max(0, (p.likesCount || 0) + delta);
      newLikes = count;
      return { ...p, likesCount: count };
    }
    return p;
  });

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(updated, null, 2),
        ContentType: 'application/json; charset=utf-8',
        CacheControl: 'public, max-age=60, stale-while-revalidate=86400',
      })
    );
  } catch (err) {
    console.warn('R2 like update error:', err);
  }

  return newLikes;
}

/**
 * Uploads a Universe & Lorebook project JSON payload to Cloudflare R2
 */
export async function uploadUniversePayloadToR2(shareId: string, payload: any): Promise<string> {
  const key = `universes/${shareId}.json`;
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=86400, stale-while-revalidate=604800',
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Fetches a Universe & Lorebook project JSON payload from Cloudflare R2
 */
export async function fetchUniversePayloadFromR2(shareId: string): Promise<any | null> {
  // 1. Try public CDN fast-path
  const cdnUrl = `${R2_PUBLIC_URL}/universes/${encodeURIComponent(shareId)}.json`;
  try {
    const res = await fetch(cdnUrl, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // 2. Direct S3 GetObject fallback
  try {
    const getRes = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `universes/${shareId}.json`,
      })
    );
    const bodyStr = await getRes.Body?.transformToString();
    if (bodyStr) {
      return JSON.parse(bodyStr);
    }
  } catch (err) {
    console.warn('R2 GetObject error for universe:', shareId, err);
  }

  return null;
}

/**
 * Deletes a Universe JSON payload from Cloudflare R2
 */
export async function deleteUniversePayloadFromR2(shareId: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `universes/${shareId}.json`,
      })
    );
  } catch (err) {
    console.warn('R2 Delete error for universe:', shareId, err);
  }
}

export interface UniverseInteractionData {
  reactions: {
    love: number;
    sparkle: number;
    sakura: number;
    chill: number;
    fire: number;
    idea: number;
  };
  comments: Array<{
    id: string;
    authorName: string;
    authorEmail?: string;
    authorRole?: string;
    avatarSeed?: string;
    avatarColor?: string;
    text: string;
    createdAt: string;
    updatedAt?: string;
    isEdited?: boolean;
    likes: number;
    badge?: string;
  }>;
}

/**
 * Fetches interactions (reactions and discussion comments) for a shared universe
 */
export async function fetchUniverseInteractionsFromR2(shareId: string): Promise<UniverseInteractionData> {
  const key = `interactions/uni_${shareId}.json`;
  const defaultData: UniverseInteractionData = {
    reactions: { love: 0, sparkle: 0, sakura: 0, chill: 0, fire: 0, idea: 0 },
    comments: [],
  };

  // 1. Try CDN fast-path
  const cdnUrl = `${R2_PUBLIC_URL}/${key}`;
  try {
    const res = await fetch(cdnUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        reactions: { ...defaultData.reactions, ...(data.reactions || {}) },
        comments: Array.isArray(data.comments) ? data.comments : [],
      };
    }
  } catch {}

  // 2. Direct S3 GetObject fallback
  try {
    const getRes = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    const bodyStr = await getRes.Body?.transformToString();
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      return {
        reactions: { ...defaultData.reactions, ...(parsed.reactions || {}) },
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      };
    }
  } catch (err) {
    // Key might not exist yet
  }

  return defaultData;
}

/**
 * Saves interactions (reactions and discussion comments) for a shared universe
 */
export async function saveUniverseInteractionsToR2(shareId: string, data: UniverseInteractionData): Promise<void> {
  const key = `interactions/uni_${shareId}.json`;
  const body = JSON.stringify(data, null, 2);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=5, stale-while-revalidate=60',
    })
  );
}

