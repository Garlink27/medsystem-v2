/**
 * Seed script — run with:  npm run seed
 * Populates the DB with demo roles, users and one patient record.
 */
import { config } from 'dotenv';
config({ path: '.env.local' }); // load TURSO_* vars before anything else

import { createClient } from '@libsql/client';

const db = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
  console.log('🌱 Seeding...');

  await db.batch([
    "INSERT OR IGNORE INTO Roles VALUES (1,'Administrador')",
    "INSERT OR IGNORE INTO Roles VALUES (2,'Jefe Médico')",
    "INSERT OR IGNORE INTO Roles VALUES (3,'Doctor')",
    "INSERT OR IGNORE INTO Roles VALUES (4,'Nutriólogo')",
    "INSERT OR IGNORE INTO Roles VALUES (5,'Estudiante')",
    "INSERT OR IGNORE INTO Roles VALUES (6,'Staff')",
    "INSERT OR IGNORE INTO Roles VALUES (7,'Entrenador')",
  ]);

  // password stored as plaintext for demo — use bcrypt in production
  await db.batch([
    "INSERT OR IGNORE INTO Users VALUES (1,'María','González','patient@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (2,'Carlos','Ramírez','doctor@demo.com','doctor123',3)",
    "INSERT OR IGNORE INTO Users VALUES (3,'Ana','López','ana@demo.com','doctor123',3)",
    "INSERT OR IGNORE INTO Users VALUES (4,'Admin','Sistema','admin@demo.com','admin123',1)",
  ]);

  await db.batch([
    "INSERT OR IGNORE INTO Patients VALUES (1,'2002-05-14','F','O+','Penicilina',62.5,1.65,1,'Universidad')",
  ]);

  await db.batch([
    "INSERT OR IGNORE INTO Appointments VALUES (1,1,2,'2026-03-15 10:00:00','Pendiente')",
    "INSERT OR IGNORE INTO Appointments VALUES (2,1,3,'2026-03-20 11:30:00','Aceptada')",
    "INSERT OR IGNORE INTO Appointments VALUES (3,1,2,'2026-02-15 12:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (4,1,2,'2026-03-18 09:00:00','Aceptada')",
  ]);

  await db.batch([
    "INSERT OR IGNORE INTO Consultations VALUES (1,3,'Hipertensión arterial controlada','Dolor de cabeza, Visión borrosa','2026-02-15')",
  ]);

  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });