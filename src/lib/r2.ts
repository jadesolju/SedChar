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
