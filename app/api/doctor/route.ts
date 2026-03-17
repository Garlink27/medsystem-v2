import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/doctor?doctorId=2
export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get('doctorId');
  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });

  const id = Number(doctorId);

  const [profileRes, patientsRes, aptsRes] = await Promise.all([
    // Doctor profile from Users + Roles
    db.execute({
      sql: `SELECT u.userId, u.firstName, u.lastName, u.email, r.roleName
            FROM Users u JOIN Roles r ON r.roleId = u.roleId
            WHERE u.userId = ?`,
      args: [id],
    }),
    // Distinct patients this doctor has seen
    db.execute({
      sql: `SELECT DISTINCT u.userId, u.firstName, u.lastName, u.email,
                   p.bloodType, p.allergies, p.weight, p.height, p.isAthlete,
                   p.schoolLevel, p.dateOfBirth, p.gender
            FROM   Appointments a
            JOIN   Users u    ON u.userId = a.patientId
            JOIN   Patients p ON p.patientId = a.patientId
            WHERE  a.doctorId = ?`,
      args: [id],
    }),
    // All appointments for this doctor
    db.execute({
      sql: `SELECT a.*,
                   u.firstName || ' ' || u.lastName AS patientName
            FROM   Appointments a
            JOIN   Users u ON u.userId = a.patientId
            WHERE  a.doctorId = ?
            ORDER  BY a.dateTime DESC`,
      args: [id],
    }),
  ]);

  return NextResponse.json({
    profile:      profileRes.rows[0] ?? null,
    patients:     patientsRes.rows,
    appointments: aptsRes.rows,
  });
}

// PATCH /api/doctor — update appointment status (doctor changes it)
export async function PATCH(req: NextRequest) {
  const { appointmentId, status } = await req.json();
  await db.execute({
    sql:  `UPDATE Appointments SET status = ? WHERE appointmentId = ?`,
    args: [status, appointmentId],
  });
  return NextResponse.json({ ok: true });
}
