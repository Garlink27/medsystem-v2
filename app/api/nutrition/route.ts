import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/nutrition
export async function GET() {
  const result = await db.execute({
    sql: `SELECT n.*,
                 u.firstName || ' ' || u.lastName AS patientName
          FROM   NutritionalProfiles n
          JOIN   Users u ON u.userId = n.patientId
          ORDER  BY n.createdAt DESC`,
    args: [],
  });
  return NextResponse.json({ profiles: result.rows });
}

// POST /api/nutrition — create nutritional profile
export async function POST(req: NextRequest) {
  const {
    patientId, waistCircumference, bodyFatPercentage,
    physicalActivityLevel, nutritionalDiagnosis, metabolicRisk,
    nutritionalObjective, waterConsumptionLiters,
    dietaryHabits, familyHistory,
  } = await req.json();

  const result = await db.execute({
    sql: `INSERT INTO NutritionalProfiles
            (patientId, waistCircumference, bodyFatPercentage, physicalActivityLevel,
             nutritionalDiagnosis, metabolicRisk, nutritionalObjective,
             waterConsumptionLiters, dietaryHabits, familyHistory)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      Number(patientId),
      waistCircumference   ? Number(waistCircumference)   : null,
      bodyFatPercentage    ? Number(bodyFatPercentage)    : null,
      physicalActivityLevel ?? null,
      nutritionalDiagnosis  ?? null,
      metabolicRisk         ?? null,
      nutritionalObjective  ?? null,
      waterConsumptionLiters? Number(waterConsumptionLiters) : null,
      dietaryHabits         ?? null,
      familyHistory         ?? null,
    ],
  });

  return NextResponse.json({ profileId: Number(result.lastInsertRowid) }, { status: 201 });
}

// PATCH /api/nutrition — update profile
export async function PATCH(req: NextRequest) {
  const { profileId, ...fields } = await req.json();
  const keys   = Object.keys(fields);
  const values = Object.values(fields);

  if (!keys.length) return NextResponse.json({ error: 'No fields' }, { status: 400 });

  const sets = keys.map(k => `${k} = ?`).join(', ');
  await db.execute({
    sql:  `UPDATE NutritionalProfiles SET ${sets} WHERE profileId = ?`,
    args: [...values, profileId],
  });

  return NextResponse.json({ ok: true });
}
