import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import type { LoginInput } from '@/app/types';

export async function POST(req: NextRequest) {
  const { email, password }: LoginInput = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
  }

  try {
    // Join Users + Roles to get roleName in one query
    const result = await db.execute({
      sql: `SELECT u.userId, u.firstName, u.lastName, u.email, u.password,
                   r.roleName
            FROM   Users u
            JOIN   Roles r ON r.roleId = u.roleId
            WHERE  u.email = ?
            LIMIT  1`,
      args: [email],
    });

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const user = result.rows[0];

    // ⚠️  Plain-text comparison for demo.
    // In production: use bcrypt.compare(password, user.password as string)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Build minimal session payload
    const session = {
      userId:    user.userId,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      roleName:  user.roleName,
    };

    // Set HttpOnly cookie (7 days)
    const response = NextResponse.json({ ok: true, roleName: user.roleName, userId: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email });
    response.cookies.set('session', JSON.stringify(session), {
      httpOnly: true,
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}