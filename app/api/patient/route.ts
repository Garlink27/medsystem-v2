import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import type { UpdatePatientInput } from '@/app/types';

// GET /api/patient?patientId=1
export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get('patientId');
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });

  const result = await db.execute({
    sql: `SELECT u.userId, u.firstName, u.lastName, u.email,
                 p.dateOfBirth, p.gender, p.bloodType, p.allergies,
                 p.weight, p.height, p.isAthlete, p.schoolLevel
          FROM   Users u
          JOIN   Patients p ON p.patientId = u.userId
          WHERE  u.userId = ?`,
    args: [Number(patientId)],
  });

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

// PATCH /api/patient — update patient + user info
export async function PATCH(req: NextRequest) {
  const body: UpdatePatientInput = await req.json();
  const { patientId, firstName, lastName, email, dateOfBirth, gender, bloodType, allergies, weight, height, isAthlete, schoolLevel } = body;

  if (firstName || lastName || email) {
    await db.execute({
      sql:  `UPDATE Users
             SET firstName = COALESCE(?, firstName),
                 lastName  = COALESCE(?, lastName),
                 email     = COALESCE(?, email)
             WHERE userId = ?`,
      args: [firstName ?? null, lastName ?? null, email ?? null, patientId],
    });
  }

  await db.execute({
    sql:  `UPDATE Patients
           SET dateOfBirth = COALESCE(?, dateOfBirth),
               gender      = COALESCE(?, gender),
               bloodType   = COALESCE(?, bloodType),
               allergies   = COALESCE(?, allergies),
               weight      = COALESCE(?, weight),
               height      = COALESCE(?, height),
               isAthlete   = COALESCE(?, isAthlete),
               schoolLevel = COALESCE(?, schoolLevel)
           WHERE patientId = ?`,
    args: [
      dateOfBirth ?? null, gender ?? null, bloodType ?? null,
      allergies ?? null, weight ?? null, height ?? null,
      isAthlete !== undefined ? (isAthlete ? 1 : 0) : null,
      schoolLevel ?? null,
      patientId,
    ],
  });

  return NextResponse.json({ ok: true });
}
