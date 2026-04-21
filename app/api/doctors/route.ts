// app/api/admin/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/admin/doctors — list all doctors with stats
export async function GET() {
  const result = await db.execute({
    sql: `SELECT u.userId, u.firstName, u.lastName, u.email, r.roleName,
                 (SELECT COUNT(DISTINCT patientId) FROM Appointments WHERE doctorId = u.userId) AS patientCount,
                 (SELECT COUNT(*) FROM Appointments WHERE doctorId = u.userId) AS aptCount,
                 (SELECT COUNT(*) FROM Appointments WHERE doctorId = u.userId AND status = 'Completada') AS completedCount
          FROM   Users u
          JOIN   Roles r ON r.roleId = u.roleId
          WHERE  r.roleName IN ('Doctor','Jefe Médico','Nutriólogo','Entrenador')
          ORDER  BY u.firstName ASC`,
    args: [],
  });

  const doctors = result.rows.map(r => ({
    userId:         Number(r.userId),
    firstName:      String(r.firstName ?? ''),
    lastName:       String(r.lastName  ?? ''),
    email:          String(r.email     ?? ''),
    roleName:       String(r.roleName  ?? ''),
    patientCount:   Number(r.patientCount   ?? 0),
    aptCount:       Number(r.aptCount       ?? 0),
    completedCount: Number(r.completedCount ?? 0),
  }));

  return NextResponse.json({ doctors });
}

// POST /api/admin/doctors — create new doctor user
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password, roleName } = await req.json();

  if (!firstName || !lastName || !email || !password || !roleName) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  try {
    // 1. Get roleId for the given roleName
    const roleRes = await db.execute({
      sql:  `SELECT roleId FROM Roles WHERE roleName = ? LIMIT 1`,
      args: [roleName],
    });

    if (!roleRes.rows.length) {
      return NextResponse.json({ error: `Rol '${roleName}' no encontrado` }, { status: 400 });
    }

    const roleId = Number(roleRes.rows[0].roleId);

    // 2. Check email not already taken
    const existingRes = await db.execute({
      sql:  `SELECT userId FROM Users WHERE email = ? LIMIT 1`,
      args: [email],
    });

    if (existingRes.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 });
    }

    // 3. Insert new user
    // ⚠️ Plain-text password for demo — use bcrypt in production
    const insertRes = await db.execute({
      sql:  `INSERT INTO Users (firstName, lastName, email, password, roleId)
             VALUES (?, ?, ?, ?, ?)`,
      args: [firstName, lastName, email, password, roleId],
    });

    return NextResponse.json(
      { userId: Number(insertRes.lastInsertRowid) },
      { status: 201 }
    );
  } catch (err) {
    console.error('[admin/doctors POST]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}