import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/records?doctorId=2
// Returns all consultations for a doctor, joined with patient name
export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get('doctorId');
  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });

  const result = await db.execute({
    sql: `SELECT c.*,
                 u.firstName || ' ' || u.lastName AS patientName,
                 a.patientId
          FROM   Consultations c
          JOIN   Appointments a ON a.appointmentId = c.appointmentId
          JOIN   Users u        ON u.userId        = a.patientId
          WHERE  a.doctorId = ?
          ORDER  BY c.consultationDate DESC`,
    args: [Number(doctorId)],
  });

  return NextResponse.json({ consultations: result.rows });
}

// POST /api/records — create a new consultation
// Requires: patientId, doctorId, consultationDate, diagnosis
// Optional: symptomsRaw (comma-separated), prescRaw (comma-separated), notes
export async function POST(req: NextRequest) {
  const { patientId, doctorId, consultationDate, diagnosis, symptomsRaw, prescRaw } = await req.json();

  if (!patientId || !doctorId || !diagnosis) {
    return NextResponse.json({ error: 'patientId, doctorId and diagnosis are required' }, { status: 400 });
  }

  // 1. Find or create a matching Appointment for this patient+doctor on this date
  //    so Consultations.appointmentId has a valid FK
  let appointmentId: number;

  const existingApt = await db.execute({
    sql: `SELECT appointmentId FROM Appointments
          WHERE patientId = ? AND doctorId = ?
          AND   date(dateTime) = date(?)
          AND   status != 'Cancelada'
          LIMIT 1`,
    args: [Number(patientId), Number(doctorId), consultationDate],
  });

  if (existingApt.rows.length > 0) {
    appointmentId = existingApt.rows[0].appointmentId as number;
    // Mark the appointment as Completada
    await db.execute({
      sql:  `UPDATE Appointments SET status = 'Completada' WHERE appointmentId = ?`,
      args: [appointmentId],
    });
  } else {
    // Create a new completed appointment for today
    const newApt = await db.execute({
      sql:  `INSERT INTO Appointments (patientId, doctorId, dateTime, status)
             VALUES (?, ?, ?, 'Completada')`,
      args: [Number(patientId), Number(doctorId), `${consultationDate} 12:00:00`],
    });
    appointmentId = Number(newApt.lastInsertRowid);
  }

  // 2. Create the consultation
  const conResult = await db.execute({
    sql:  `INSERT INTO Consultations (appointmentId, diagnosis, symptoms, consultationDate)
           VALUES (?, ?, ?, ?)`,
    args: [appointmentId, diagnosis, symptomsRaw ?? '', consultationDate],
  });

  const consultationId = Number(conResult.lastInsertRowid);

  // 3. If prescriptions provided, insert each one
  // For now we store them as text in a ClinicalFile row (PDF Receta)
  // Real flow would require medication IDs from the Medications table
  if (prescRaw && prescRaw.trim()) {
    await db.execute({
      sql:  `INSERT INTO ClinicalFiles (consultationId, fileType, fileUrl)
             VALUES (?, 'PDF Receta', ?)`,
      args: [consultationId, `data:text/plain,${encodeURIComponent(prescRaw)}`],
    });
  }

  return NextResponse.json({ consultationId }, { status: 201 });
}

// PATCH /api/records — update an existing consultation
export async function PATCH(req: NextRequest) {
  const { consultationId, diagnosis, symptomsRaw, consultationDate } = await req.json();

  if (!consultationId) return NextResponse.json({ error: 'consultationId required' }, { status: 400 });

  await db.execute({
    sql:  `UPDATE Consultations
           SET diagnosis        = COALESCE(?, diagnosis),
               symptoms         = COALESCE(?, symptoms),
               consultationDate = COALESCE(?, consultationDate)
           WHERE consultationId = ?`,
    args: [diagnosis ?? null, symptomsRaw ?? null, consultationDate ?? null, consultationId],
  });

  return NextResponse.json({ ok: true });
}