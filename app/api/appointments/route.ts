import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import type { CreateAppointmentInput, UpdateAppointmentInput } from '@/app/types';

// GET /api/appointments?patientId=1
export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get('patientId');
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });

  const result = await db.execute({
    sql: `SELECT a.*,
                 u.firstName || ' ' || u.lastName AS doctorName
          FROM   Appointments a
          JOIN   Users u ON u.userId = a.doctorId
          WHERE  a.patientId = ?
          ORDER  BY a.dateTime DESC`,
    args: [Number(patientId)],
  });

  return NextResponse.json(result.rows);
}

// POST /api/appointments — create new appointment
export async function POST(req: NextRequest) {
  const body: CreateAppointmentInput = await req.json();

  const result = await db.execute({
    sql:  `INSERT INTO Appointments (patientId, doctorId, dateTime, status)
           VALUES (?, ?, ?, 'Pendiente')`,
    args: [body.patientId, body.doctorId, body.dateTime],
  });

  return NextResponse.json(
    { appointmentId: Number(result.lastInsertRowid) },
    { status: 201 }
  );
}

// PATCH /api/appointments — update status or dateTime
export async function PATCH(req: NextRequest) {
  const body: UpdateAppointmentInput = await req.json();

  await db.execute({
    sql:  `UPDATE Appointments
           SET    status   = COALESCE(?, status),
                  dateTime = COALESCE(?, dateTime)
           WHERE  appointmentId = ?`,
    args: [body.status ?? null, body.dateTime ?? null, body.appointmentId],
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/appointments?appointmentId=1 — soft-cancel
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('appointmentId');
  if (!id) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });

  await db.execute({
    sql:  `UPDATE Appointments SET status = 'Cancelada' WHERE appointmentId = ?`,
    args: [Number(id)],
  });

  return NextResponse.json({ ok: true });
}
