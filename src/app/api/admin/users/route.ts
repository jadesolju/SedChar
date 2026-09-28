import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PASSCODES = ['sedchar-master-2026', 'admin67x', '••••••'];

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const passcodeHeader = req.headers.get('x-admin-passcode') || '';

  if (VALID_PASSCODES.includes(token) || VALID_PASSCODES.includes(passcodeHeader)) {
    return true;
  }
  return false;
}

// GET /api/admin/users — List registered users and their roles
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin Passcode required' },
      { status: 401 }
    );
  }

  try {
    const { client, isServiceRole } = getSupabaseAdmin();
    const userMap = new Map<string, {
      id: string;
      email: string;
      role: 'admin' | 'premium' | 'free';
      created_at: string;
      last_sign_in_at: string | null;
      characters_count: number;
    }>();

    // 1. Fetch character counts by user_id
    const charCountMap = new Map<string, number>();
    try {
      const { data: charData } = await client
        .from('characters')
        .select('user_id');

      if (charData && Array.isArray(charData)) {
        charData.forEach((row: { user_id: string }) => {
          if (row.user_id) {
            charCountMap.set(row.user_id, (charCountMap.get(row.user_id) || 0) + 1);
          }
        });
      }
    } catch (e) {
      console.warn('Could not fetch character counts:', e);
    }

    // 2. Fetch profiles table if exists
    try {
      const { data: profileData } = await client
        .from('profiles')
        .select('id, email, role, updated_at');

      if (profileData && Array.isArray(profileData)) {
        profileData.forEach((p: any) => {
          if (p.id) {
            userMap.set(p.id, {
              id: p.id,
              email: p.email || '—',
              role: (p.role as any) || 'free',
              created_at: p.updated_at || new Date().toISOString(),
              last_sign_in_at: null,
              characters_count: charCountMap.get(p.id) || 0,
            });
          }
        });
      }
    } catch {
      // profiles table might not exist yet
    }

    // 3. Fetch Supabase Auth Users (Requires Service Role Key)
    let hasAuthAdminAccess = false;
    if (isServiceRole) {
      try {
        const { data, error } = await client.auth.admin.listUsers({
          page: 1,
          perPage: 100,
        });

        if (!error && data?.users) {
          hasAuthAdminAccess = true;
          data.users.forEach((u) => {
            const rawRole = (u.user_metadata?.role || u.app_metadata?.role || 'free') as 'admin' | 'premium' | 'free';
            const existing = userMap.get(u.id);

            userMap.set(u.id, {
              id: u.id,
              email: u.email || existing?.email || '—',
              role: rawRole || existing?.role || 'free',
              created_at: u.created_at || existing?.created_at || new Date().toISOString(),
              last_sign_in_at: u.last_sign_in_at || null,
              characters_count: charCountMap.get(u.id) || 0,
            });
          });
        }
      } catch (authErr) {
        console.warn('Auth admin listUsers note:', authErr);
      }
    }

    // 4. Also add any users found in characters table that might not be in the map yet
    charCountMap.forEach((count, uid) => {
      if (!userMap.has(uid) && uid !== 'guest') {
        userMap.set(uid, {
          id: uid,
          email: 'User ' + uid.slice(0, 8),
          role: 'free',
          created_at: new Date().toISOString(),
          last_sign_in_at: null,
          characters_count: count,
        });
      }
    });

    const users = Array.from(userMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      users,
      hasServiceRole: isServiceRole && hasAuthAdminAccess,
      total: users.length,
    });
  } catch (err: any) {
    console.error('Admin GET users error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to list users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users — Adjust role for a user (by userId or email)
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin Passcode required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, email, role } = body;

    if (!role || !['admin', 'premium', 'free'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be free, premium, or admin.' },
        { status: 400 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    const { client, isServiceRole } = getSupabaseAdmin();
    let targetUserId = userId;
    let targetEmail = email;

    // If only email is provided and we have Service Role, lookup userId
    if (!targetUserId && targetEmail && isServiceRole) {
      try {
        const { data } = await client.auth.admin.listUsers();
        const found = data?.users?.find(
          (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
        );
        if (found) {
          targetUserId = found.id;
          targetEmail = found.email || targetEmail;
        }
      } catch (e) {
        console.warn('Error looking up user by email:', e);
      }
    }

    // 1. Update Supabase Auth user_metadata if we have targetUserId and Service Role
    let authUpdated = false;
    if (targetUserId && isServiceRole) {
      try {
        const { error: updateAuthErr } = await client.auth.admin.updateUserById(
          targetUserId,
          {
            user_metadata: { role },
          }
        );
        if (!updateAuthErr) {
          authUpdated = true;
        } else {
          console.warn('auth.admin.updateUserById note:', updateAuthErr.message);
        }
      } catch (authErr) {
        console.warn('Auth admin update error:', authErr);
      }
    }

    // 2. Upsert into profiles table
    let profileUpdated = false;
    if (targetUserId) {
      try {
        const { error: profileErr } = await client.from('profiles').upsert({
          id: targetUserId,
          email: targetEmail || null,
          role,
          updated_at: new Date().toISOString(),
        });
        if (!profileErr) {
          profileUpdated = true;
        }
      } catch (pErr) {
        console.warn('Profiles table upsert note:', pErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `ปรับสิทธิ์ผู้ใช้ [${targetEmail || targetUserId}] เป็น ${role.toUpperCase()} เรียบร้อยแล้ว`,
      user: {
        id: targetUserId,
        email: targetEmail,
        role,
        authUpdated,
        profileUpdated,
      },
    });
  } catch (err: any) {
    console.error('Admin POST adjust role error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
