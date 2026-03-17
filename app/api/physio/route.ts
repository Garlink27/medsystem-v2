import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/physio — get all physio notes with patient names
export async function GET() {
  const result = await db.execute({
    sql: `SELECT n.*,
                 u.firstName || ' ' || u.lastName AS patientName
          FROM   CollaborativeNotes n
          JOIN   Users u ON u.userId = n.patientId
          ORDER  BY n.createdAt DESC`,
    args: [],
  });
  return NextResponse.json({ notes: result.rows });
}

// POST /api/physio — create new note
export async function POST(req: NextRequest) {
  const { patientId, noteContent, isAlert, alertTags, authorId } = await req.json();

  const result = await db.execute({
    sql:  `INSERT INTO CollaborativeNotes (patientId, authorId, noteContent, isAlert, alertTags)
           VALUES (?, ?, ?, ?, ?)`,
    args: [Number(patientId), Number(authorId), noteContent, isAlert ? 1 : 0, alertTags ?? ''],
  });

  return NextResponse.json({ noteId: Number(result.lastInsertRowid) }, { status: 201 });
}

// DELETE /api/physio?noteId=1
export async function DELETE(req: NextRequest) {
  const noteId = req.nextUrl.searchParams.get('noteId');
  if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 });

  await db.execute({ sql: `DELETE FROM CollaborativeNotes WHERE noteId = ?`, args: [Number(noteId)] });
  return NextResponse.json({ ok: true });
}
