import { NextRequest, NextResponse } from 'next/server';
import {
  uploadUniversePayloadToR2,
  fetchUniversePayloadFromR2,
  fetchUserUniversesFromR2,
  saveUserUniverseIndexToR2,
  saveUserUniverseToR2,
} from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/universe/sync-author
 * Synchronizes author name and ownership between User Profile and Cloudflare R2 universe payloads.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId, userId, author, projectTitle, updateAllUserProjects } = body;

    const cleanAuthor = typeof author === 'string' ? author.trim() : '';
    if (!cleanAuthor) {
      return NextResponse.json({ error: 'Missing author name' }, { status: 400 });
    }

    let updatedSingleShare = false;

    // 1. If a specific shareId is targeted, update its R2 payload directly
    if (shareId && typeof shareId === 'string') {
      try {
        const payload = await fetchUniversePayloadFromR2(shareId);
        if (payload) {
          payload.author = cleanAuthor;
          if (userId && userId !== 'guest' && userId !== 'anonymous') {
            payload.userId = userId;
          }
          if (projectTitle && typeof projectTitle === 'string' && projectTitle.trim()) {
            payload.title = projectTitle.trim();
            if (payload.project?.worldSetting) {
              payload.project.worldSetting.projectName = projectTitle.trim();
            }
          }
          if (payload.project?.worldSetting) {
            (payload.project.worldSetting as any).author = cleanAuthor;
          }
          payload.updatedAt = new Date().toISOString();

          await uploadUniversePayloadToR2(shareId, payload);
          updatedSingleShare = true;
        }
      } catch (err) {
        console.warn(`Failed to update R2 share payload for ${shareId}:`, err);
      }
    }

    // 2. If userId is provided, sync author across all user projects in R2
    let updatedIndexCount = 0;
    if (userId && userId !== 'guest' && userId !== 'anonymous') {
      try {
        const userProjects = await fetchUserUniversesFromR2(userId);
        if (Array.isArray(userProjects) && userProjects.length > 0) {
          const updatedProjects = await Promise.all(
            userProjects.map(async (item) => {
              const updatedItem = {
                ...item,
                author: cleanAuthor,
                updatedAt: new Date().toISOString(),
              };
              if (updatedItem.projectData) {
                updatedItem.projectData = {
                  ...updatedItem.projectData,
                  author: cleanAuthor,
                };
              }

              // If bulk update requested and project has a shareId, update that share's R2 payload too
              if (updateAllUserProjects && item.shareId && item.shareId !== shareId) {
                try {
                  const sharePayload = await fetchUniversePayloadFromR2(item.shareId);
                  if (sharePayload) {
                    sharePayload.author = cleanAuthor;
                    sharePayload.userId = userId;
                    sharePayload.updatedAt = new Date().toISOString();
                    await uploadUniversePayloadToR2(item.shareId, sharePayload);
                  }
                } catch (subErr) {
                  console.warn(`Bulk sync error for share ${item.shareId}:`, subErr);
                }
              }

              return updatedItem;
            })
          );

          await saveUserUniverseIndexToR2(userId, updatedProjects);
          updatedIndexCount = updatedProjects.length;
        }
      } catch (indexErr) {
        console.warn('Failed to sync user universe index:', indexErr);
      }
    }

    return NextResponse.json({
      success: true,
      author: cleanAuthor,
      updatedSingleShare,
      updatedIndexCount,
    });
  } catch (error: any) {
    console.error('Error in /api/universe/sync-author:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
