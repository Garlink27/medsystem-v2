import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/consultations?patientId=1
// Returns consultations with nested prescriptions and clinical files
export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get('patientId');
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });

  const id = Number(patientId);

  // 1. Base consultations
  const consRes = await db.execute({
    sql: `SELECT c.*,
                 u.firstName || ' ' || u.lastName AS doctorName
          FROM   Consultations c
          JOIN   Appointments a ON a.appointmentId = c.appointmentId
          JOIN   Users u        ON u.userId        = a.doctorId
          WHERE  a.patientId = ?
          ORDER  BY c.consultationDate DESC`,
    args: [id],
  });

  if (consRes.rows.length === 0) {
    return NextResponse.json({ consultations: [] });
  }

  // 2. All prescriptions for these consultations
  const conIds = consRes.rows.map(r => r.consultationId as number);
  const placeholders = conIds.map(() => '?').join(',');

  const rxRes = await db.execute({
    sql: `SELECT p.*, m.brandName, m.activeIngredient, m.presentation
          FROM   Prescriptions p
          JOIN   Medications m ON m.medicationId = p.medicationId
          WHERE  p.consultationId IN (${placeholders})`,
    args: conIds,
  });

  // 3. All clinical files for these consultations
  const filesRes = await db.execute({
    sql: `SELECT * FROM ClinicalFiles
          WHERE consultationId IN (${placeholders})`,
    args: conIds,
  });

  // 4. Merge: attach prescriptions and files to each consultation
  const consultations = consRes.rows.map(con => ({
    ...con,
    prescriptions: rxRes.rows.filter(
      rx => rx.consultationId === con.consultationId
    ),
    files: filesRes.rows.filter(
      f => f.consultationId === con.consultationId
      // Exclude auto-generated prescription text files
      && !String(f.fileUrl).startsWith('data:text')
    ),
  }));

  return NextResponse.json({ consultations });
}