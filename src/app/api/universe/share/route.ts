import { NextRequest, NextResponse } from 'next/server';
import { uploadUniversePayloadToR2, fetchUniversePayloadFromR2, deleteUniversePayloadFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateShortId(prefix: string = 'uni'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${str}`;
}

// GET /api/universe/share?shareId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get('shareId') || searchParams.get('id');

  if (!shareId) {
    return NextResponse.json({ error: 'Missing shareId parameter' }, { status: 400 });
  }

  try {
    // 1. Fetch payload from Cloudflare R2
    const r2Payload = await fetchUniversePayloadFromR2(shareId);
    if (r2Payload) {
      return NextResponse.json({
        success: true,
        project: r2Payload.project || r2Payload,
        metadata: {
          shareId,
          userId: r2Payload.userId,
          title: r2Payload.title || r2Payload.project?.worldSetting?.projectName || 'Universe Project',
          author: r2Payload.author || 'Anonymous Creator',
          allowCloning: r2Payload.allowCloning !== false,
          allowCoCreation: r2Payload.allowCoCreation !== false,
          createdAt: r2Payload.createdAt || new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ error: 'ไม่พบข้อมูลจักรวาล หรือลิงก์ถูกยกเลิกแล้ว' }, { status: 404 });
  } catch (err: any) {
    console.error('Error fetching universe share payload:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/universe/share
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, shareId: requestedShareId, author, userId, allowCloning = true, allowCoCreation = true } = body;

    if (!project) {
      return NextResponse.json({ error: 'Missing project data' }, { status: 400 });
    }

    const shareId = requestedShareId?.trim() || generateShortId('uni');
    const projectTitle = project.worldSetting?.projectName?.trim() || project.title || 'จักรวาลและคลังความจำ';

    const payload = {
      shareId,
      userId: userId || 'anonymous',
      author: author || 'ผู้สร้าง SedChar',
      title: projectTitle,
      project,
      allowCloning: allowCloning !== false,
      allowCoCreation: allowCoCreation !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Upload to Cloudflare R2
    const cdnUrl = await uploadUniversePayloadToR2(shareId, payload);

    // 2. Automatically save & sync into user's personal Cloud Library in R2
    if (userId && userId !== 'anonymous' && userId !== 'guest') {
      try {
        const { saveUserUniverseToR2, fetchUserUniversesFromR2, saveUserUniverseIndexToR2 } = await import('@/lib/r2');
        const userRecord = {
          id: shareId,
          title: projectTitle,
          description: project.worldSetting?.genreTone || project.worldSetting?.mainLocation || 'จักรวาลและคลังความจำ',
          mainCharCount: project.mainCharacters?.length || 0,
          subCharCount: project.supportingCharacters?.length || 0,
          routeCount: project.routes?.length || 0,
          projectData: project,
          shareId,
          shareUrl: `/universe/share/${shareId}`,
          isShared: true,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        };
        await saveUserUniverseToR2(userId, shareId, userRecord);
        const existing = await fetchUserUniversesFromR2(userId);
        const filtered = existing.filter((p) => p.id !== shareId && p.shareId !== shareId);
        await saveUserUniverseIndexToR2(userId, [userRecord, ...filtered]);
      } catch (saveLibErr) {
        console.warn('Auto-save universe share to user library note:', saveLibErr);
      }
    }

    return NextResponse.json({
      success: true,
      shareId,
      cdnUrl,
      shareUrl: `/universe/share/${shareId}`,
    });
  } catch (err: any) {
    console.error('Error sharing universe project:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/universe/share?shareId=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get('shareId');

  if (!shareId) {
    return NextResponse.json({ error: 'Missing shareId' }, { status: 400 });
  }

  try {
    await deleteUniversePayloadFromR2(shareId);
    return NextResponse.json({ success: true, message: 'Unlisted link revoked' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
