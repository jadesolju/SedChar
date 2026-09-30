import { NextRequest, NextResponse } from 'next/server';
import { uploadAvatarToR2 } from '@/lib/r2';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer | null = null;
    let mimeType = 'image/webp';
    let userId = 'anon';

    // 1. Authenticate user if possible
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type || 'image/webp';
    } else {
      const body = await request.json();
      const { image, userId: clientUserId } = body || {};
      if (clientUserId && userId === 'anon') {
        userId = clientUserId;
      }

      if (!image || typeof image !== 'string') {
        return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
      }

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          // If SVG or plaintext data URL
          const svgMatch = image.match(/^data:image\/svg\+xml;utf8,(.+)$/);
          if (svgMatch && svgMatch[1]) {
            mimeType = 'image/svg+xml';
            buffer = Buffer.from(decodeURIComponent(svgMatch[1]), 'utf-8');
          } else {
            return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
          }
        }
      } else {
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file buffer' }, { status: 400 });
    }

    // Safety limit: 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 2. Upload to Cloudflare R2
    const publicUrl = await uploadAvatarToR2(userId, buffer, mimeType);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
