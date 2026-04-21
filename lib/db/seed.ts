/**
 * Seed script — run with:  npm run seed
 * Populates ALL tables with realistic demo data.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

const db = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── 1. ROLES ──────────────────────────────────────────────────────────
  console.log('📋 Roles...');
  await db.batch([
    "INSERT OR IGNORE INTO Roles VALUES (1,'Administrador')",
    "INSERT OR IGNORE INTO Roles VALUES (2,'Jefe Médico')",
    "INSERT OR IGNORE INTO Roles VALUES (3,'Doctor')",
    "INSERT OR IGNORE INTO Roles VALUES (4,'Nutriólogo')",
    "INSERT OR IGNORE INTO Roles VALUES (5,'Estudiante')",
    "INSERT OR IGNORE INTO Roles VALUES (6,'Staff')",
    "INSERT OR IGNORE INTO Roles VALUES (7,'Entrenador')",
  ]);

  // ── 2. USERS ──────────────────────────────────────────────────────────
  console.log('👤 Users...');
  await db.batch([
    // Administrador
    "INSERT OR IGNORE INTO Users VALUES (1,'Admin','Sistema','admin@demo.com','admin123',1)",
    // Jefe Médico
    "INSERT OR IGNORE INTO Users VALUES (2,'Roberto','Mendoza','jefe@demo.com','jefe123',2)",
    // Doctores
    "INSERT OR IGNORE INTO Users VALUES (3,'Carlos','Ramírez','doctor@demo.com','doctor123',3)",
    "INSERT OR IGNORE INTO Users VALUES (4,'Ana','López','ana@demo.com','doctor123',3)",
    "INSERT OR IGNORE INTO Users VALUES (5,'Jorge','Herrera','jorge@demo.com','doctor123',3)",
    // Nutriólogos
    "INSERT OR IGNORE INTO Users VALUES (6,'Sofía','Vega','sofia@demo.com','nutri123',4)",
    // Estudiantes (pacientes)
    "INSERT OR IGNORE INTO Users VALUES (7,'María','González','patient@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (8,'Luis','Torres','luis@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (9,'Valeria','Reyes','valeria@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (10,'Diego','Morales','diego@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (11,'Fernanda','Jiménez','fernanda@demo.com','patient123',5)",
    "INSERT OR IGNORE INTO Users VALUES (12,'Andrés','Castillo','andres@demo.com','patient123',5)",
    // Entrenador
    "INSERT OR IGNORE INTO Users VALUES (13,'Marco','Ruiz','marco@demo.com','coach123',7)",
  ]);

  // ── 3. PATIENTS ───────────────────────────────────────────────────────
  console.log('🏥 Patients...');
  await db.batch([
    "INSERT OR IGNORE INTO Patients VALUES (7,'2002-05-14','F','O+','Penicilina',62.5,1.65,1,'Universidad')",
    "INSERT OR IGNORE INTO Patients VALUES (8,'2000-11-03','M','A+',NULL,75.0,1.75,0,'Universidad')",
    "INSERT OR IGNORE INTO Patients VALUES (9,'2003-08-22','F','B-','Aspirina',55.0,1.60,1,'Preparatoria')",
    "INSERT OR IGNORE INTO Patients VALUES (10,'2001-02-17','M','AB+',NULL,90.0,1.80,0,'Universidad')",
    "INSERT OR IGNORE INTO Patients VALUES (11,'2004-06-30','F','O-','Polen',50.5,1.58,0,'Preparatoria')",
    "INSERT OR IGNORE INTO Patients VALUES (12,'1999-12-10','M','A-',NULL,82.0,1.78,1,'Universidad')",
  ]);

  // ── 4. COACH_ATHLETE ──────────────────────────────────────────────────
  console.log('🏃 Coach-Athlete...');
  await db.batch([
    "INSERT OR IGNORE INTO Coach_Athlete VALUES (13,7)",
    "INSERT OR IGNORE INTO Coach_Athlete VALUES (13,9)",
    "INSERT OR IGNORE INTO Coach_Athlete VALUES (13,12)",
  ]);

  // ── 5. APPOINTMENTS ───────────────────────────────────────────────────
  console.log('📅 Appointments...');
  await db.batch([
    "INSERT OR IGNORE INTO Appointments VALUES (1,7,3,'2026-01-10 09:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (2,7,4,'2026-01-20 10:30:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (3,7,3,'2026-02-15 12:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (4,7,3,'2026-03-15 10:00:00','Pendiente')",
    "INSERT OR IGNORE INTO Appointments VALUES (5,7,4,'2026-03-20 11:30:00','Aceptada')",
    "INSERT OR IGNORE INTO Appointments VALUES (6,8,3,'2026-01-12 08:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (7,8,5,'2026-02-05 09:30:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (8,8,3,'2026-03-18 09:00:00','Aceptada')",
    "INSERT OR IGNORE INTO Appointments VALUES (9,9,4,'2026-01-25 11:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (10,9,5,'2026-02-28 14:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (11,9,3,'2026-03-22 10:00:00','Pendiente')",
    "INSERT OR IGNORE INTO Appointments VALUES (12,10,5,'2026-02-10 16:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (13,10,3,'2026-03-05 09:00:00','Cancelada')",
    "INSERT OR IGNORE INTO Appointments VALUES (14,11,4,'2026-02-20 13:00:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (15,11,5,'2026-03-25 15:00:00','Pendiente')",
    "INSERT OR IGNORE INTO Appointments VALUES (16,12,3,'2026-01-30 08:30:00','Completada')",
    "INSERT OR IGNORE INTO Appointments VALUES (17,12,5,'2026-03-10 11:00:00','Denegada')",
  ]);

  // ── 6. CONSULTATIONS ──────────────────────────────────────────────────
  console.log('🩺 Consultations...');
  await db.batch([
    "INSERT OR IGNORE INTO Consultations VALUES (1,1,'Hipertensión arterial controlada','Dolor de cabeza, Visión borrosa, Mareos','2026-01-10')",
    "INSERT OR IGNORE INTO Consultations VALUES (2,2,'Faringitis aguda','Dolor de garganta, Fiebre, Tos seca','2026-01-20')",
    "INSERT OR IGNORE INTO Consultations VALUES (3,3,'Gastritis crónica','Dolor abdominal, Náuseas, Acidez','2026-02-15')",
    "INSERT OR IGNORE INTO Consultations VALUES (4,6,'Lumbalgia mecánica','Dolor lumbar, Rigidez matutina','2026-01-12')",
    "INSERT OR IGNORE INTO Consultations VALUES (5,7,'Migraña episódica','Cefalea pulsátil, Fotofobia, Náuseas','2026-02-05')",
    "INSERT OR IGNORE INTO Consultations VALUES (6,9,'Anemia ferropénica','Fatiga, Palidez, Mareos','2026-01-25')",
    "INSERT OR IGNORE INTO Consultations VALUES (7,10,'Dermatitis atópica','Picazón, Enrojecimiento, Resequedad','2026-02-28')",
    "INSERT OR IGNORE INTO Consultations VALUES (8,12,'Diabetes tipo 2 control','Polidipsia, Poliuria, Fatiga','2026-02-10')",
    "INSERT OR IGNORE INTO Consultations VALUES (9,14,'Hipotiroidismo','Cansancio, Aumento de peso, Frío','2026-02-20')",
    "INSERT OR IGNORE INTO Consultations VALUES (10,16,'Esguince de tobillo grado II','Dolor, Inflamación, Limitación de movimiento','2026-01-30')",
  ]);

  // ── 7. MEDICATIONS ────────────────────────────────────────────────────
  console.log('💊 Medications...');
  await db.batch([
    "INSERT OR IGNORE INTO Medications VALUES (1,'Paracetamol 500mg','Paracetamol','Tabletas',200,50)",
    "INSERT OR IGNORE INTO Medications VALUES (2,'Ibuprofeno 400mg','Ibuprofeno','Tabletas',150,30)",
    "INSERT OR IGNORE INTO Medications VALUES (3,'Amoxicilina 500mg','Amoxicilina','Cápsulas',80,20)",
    "INSERT OR IGNORE INTO Medications VALUES (4,'Omeprazol 20mg','Omeprazol','Cápsulas',120,25)",
    "INSERT OR IGNORE INTO Medications VALUES (5,'Loratadina 10mg','Loratadina','Tabletas',100,20)",
    "INSERT OR IGNORE INTO Medications VALUES (6,'Metformina 850mg','Metformina','Tabletas',15,30)",
    "INSERT OR IGNORE INTO Medications VALUES (7,'Enalapril 10mg','Enalapril','Tabletas',60,15)",
    "INSERT OR IGNORE INTO Medications VALUES (8,'Levotiroxina 50mcg','Levotiroxina','Tabletas',0,20)",
    "INSERT OR IGNORE INTO Medications VALUES (9,'Sulfato Ferroso 300mg','Hierro','Tabletas',90,20)",
    "INSERT OR IGNORE INTO Medications VALUES (10,'Diclofenaco Gel 1%','Diclofenaco','Pomada',40,10)",
    "INSERT OR IGNORE INTO Medications VALUES (11,'Sumatriptán 50mg','Sumatriptán','Tabletas',25,10)",
    "INSERT OR IGNORE INTO Medications VALUES (12,'Betametasona Crema','Betametasona','Pomada',8,15)",
  ]);

  // ── 8. BATCHES ────────────────────────────────────────────────────────
  console.log('📦 Batches...');
  await db.batch([
    "INSERT OR IGNORE INTO Batches VALUES (1,1,100,'2025-06-01','2027-06-01')",
    "INSERT OR IGNORE INTO Batches VALUES (2,1,100,'2025-09-01','2027-09-01')",
    "INSERT OR IGNORE INTO Batches VALUES (3,2,150,'2025-07-15','2027-07-15')",
    "INSERT OR IGNORE INTO Batches VALUES (4,3,80,'2025-08-01','2026-08-01')",
    "INSERT OR IGNORE INTO Batches VALUES (5,4,120,'2025-05-01','2027-05-01')",
    "INSERT OR IGNORE INTO Batches VALUES (6,5,100,'2025-10-01','2027-10-01')",
    "INSERT OR IGNORE INTO Batches VALUES (7,6,15,'2025-11-01','2026-07-01')",
    "INSERT OR IGNORE INTO Batches VALUES (8,7,60,'2025-04-01','2026-05-15')",
    "INSERT OR IGNORE INTO Batches VALUES (9,8,0,'2025-03-01','2026-03-01')",
    "INSERT OR IGNORE INTO Batches VALUES (10,9,90,'2025-12-01','2027-12-01')",
    "INSERT OR IGNORE INTO Batches VALUES (11,10,40,'2025-06-15','2027-06-15')",
    "INSERT OR IGNORE INTO Batches VALUES (12,11,25,'2025-09-15','2027-09-15')",
    "INSERT OR IGNORE INTO Batches VALUES (13,12,8,'2025-07-01','2026-04-30')",
  ]);

  // ── 9. PRESCRIPTIONS ─────────────────────────────────────────────────
  console.log('📝 Prescriptions...');
  await db.batch([
    "INSERT OR IGNORE INTO Prescriptions VALUES (1,1,7,'5mg','1 vez al día','30 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (2,1,1,'500mg','Cada 8 horas','7 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (3,2,3,'500mg','Cada 8 horas','10 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (4,2,1,'500mg','Cada 6 horas','5 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (5,3,4,'20mg','Cada 12 horas','30 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (6,3,2,'400mg','Cada 8 horas','7 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (7,4,2,'400mg','Cada 8 horas','5 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (8,5,11,'50mg','Al inicio del dolor','Según necesidad')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (9,6,9,'300mg','2 veces al día','60 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (10,7,12,'Aplicar capa fina','2 veces al día','14 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (11,7,5,'10mg','1 vez al día','30 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (12,8,6,'850mg','Con el desayuno','Permanente')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (13,9,8,'50mcg','En ayunas','Permanente')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (14,10,10,'Aplicar en zona','3 veces al día','10 días')",
    "INSERT OR IGNORE INTO Prescriptions VALUES (15,10,2,'400mg','Cada 8 horas','5 días')",
  ]);

  // ── 10. CLINICAL FILES ────────────────────────────────────────────────
  console.log('📁 ClinicalFiles...');
  await db.batch([
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (1,1,'PDF Receta','https://example.com/receta-1.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (2,2,'PDF Receta','https://example.com/receta-2.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (3,3,'PDF Receta','https://example.com/receta-3.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (4,4,'Resultados de Laboratorio','https://example.com/lab-lumbar.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (5,5,'Rayos X','https://example.com/rx-craneo.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (6,6,'Resultados de Laboratorio','https://example.com/lab-biometria.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (7,7,'Resultados de Laboratorio','https://example.com/lab-alergias.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (8,8,'Resultados de Laboratorio','https://example.com/lab-glucosa.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (9,9,'Resultados de Laboratorio','https://example.com/lab-tiroides.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (10,10,'Rayos X','https://example.com/rx-tobillo.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (11,10,'PDF Receta','https://example.com/receta-10.pdf')",
    "INSERT OR IGNORE INTO ClinicalFiles VALUES (12,1,'PDF Reporte Integral','https://example.com/reporte-1.pdf')",
  ]);

  // ── 11. NUTRITIONAL PROFILES ──────────────────────────────────────────
  console.log('🥗 NutritionalProfiles...');
  await db.batch([
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (1,7,72.0,22.5,'Moderado','Diabetes familiar','Desayuno: avena, fruta. Almuerzo: proteína, verduras','Diario: cereales, lácteos. Semanal: carnes','Come rápido, poca agua','7:00 / 14:00 / 20:00',1.8,'Sobrepeso','Alto','Reducir grasa corporal y mejorar hábitos','2026-01-15 10:00:00')",
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (2,8,85.0,18.0,'Intenso','Hipertensión familiar','Desayuno: huevos, pan. Almuerzo: pollo, arroz','Diario: pan, arroz. Semanal: legumbres','Come bien, entrena 5 días','7:30 / 14:00 / 21:00',3.0,'Normal','Bajo','Mantener masa muscular y rendimiento','2026-01-20 11:00:00')",
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (3,9,61.0,24.0,'Ligero','Anemia familiar','Desayuno: fruta, yogur. Almuerzo: ensalada','Diario: frutas. Semanal: carnes rojas','Dieta vegetariana','8:00 / 13:30 / 19:00',1.5,'Bajo peso','Moderado','Aumentar peso y corregir deficiencias','2026-01-25 09:00:00')",
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (4,10,97.0,30.5,'Sedentario','Diabetes e hipertensión','Desayuno: pan dulce, café. Almuerzo: comida rápida','Diario: azúcares y grasas','Come en exceso, sin control de porciones','9:00 / 15:00 / 22:00',1.2,'Obesidad','Muy alto','Reducción de peso y control glucémico','2026-02-01 10:00:00')",
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (5,11,57.0,21.0,'Moderado','Sin antecedentes','Desayuno: cereal, leche. Almuerzo: torta, refresco','Diario: carbohidratos simples','Omite desayuno frecuentemente','10:00 / 15:00 / 20:30',1.5,'Normal','Bajo','Mejorar calidad de la dieta y regularidad','2026-02-05 14:00:00')",
    "INSERT OR IGNORE INTO NutritionalProfiles VALUES (6,12,84.0,16.5,'Muy intenso','Sin antecedentes','Desayuno: batido proteico, avena. Almuerzo: pollo, verduras','Diario: proteínas y verduras','Disciplinado, alto rendimiento deportivo','6:00 / 12:00 / 19:00',3.5,'Normal','Bajo','Optimizar rendimiento deportivo y recuperación','2026-02-10 08:00:00')",
  ]);

  // ── 12. NUTRITIONAL PLANS ─────────────────────────────────────────────
  console.log('📋 NutritionalPlans...');
  await db.batch([
    `INSERT OR IGNORE INTO NutritionalPlans VALUES (1,7,6,1800,'Proteínas 30% / Carbohidratos 40% / Grasas 30%','{"lunes":{"desayuno":"Avena con fruta y nueces","comida":"Pechuga a la plancha con ensalada","cena":"Sopa de verduras"},"martes":{"desayuno":"Yogur con granola","comida":"Atún con arroz integral","cena":"Ensalada de espinacas"}}','Equivalencias de intercambio incluidas','Evitar azúcares refinados, aumentar fibra y agua','https://example.com/plan-1.pdf',1,'2026-02-01')`,
    `INSERT OR IGNORE INTO NutritionalPlans VALUES (2,8,6,3200,'Proteínas 35% / Carbohidratos 45% / Grasas 20%','{"lunes":{"desayuno":"Huevos revueltos con avena","comida":"Pollo con camote y brócoli","cena":"Batido de proteína con plátano"}}'  ,'Equivalencias deportivas','Priorizar proteína post-entreno, hidratación constante','https://example.com/plan-2.pdf',1,'2026-02-05')`,
    `INSERT OR IGNORE INTO NutritionalPlans VALUES (3,9,6,2200,'Proteínas 25% / Carbohidratos 50% / Grasas 25%','{"lunes":{"desayuno":"Pan integral con aguacate y huevo","comida":"Lentejas con arroz","cena":"Sopa de frijoles"}}','Equivalencias vegetarianas','Incluir fuentes de hierro no hemo con vitamina C','https://example.com/plan-3.pdf',0,'2026-02-10')`,
  ]);

  // ── 13. NUTRITIONAL FOLLOW-UPS ────────────────────────────────────────
  console.log('📊 NutritionalFollowUps...');
  await db.batch([
    `INSERT OR IGNORE INTO NutritionalFollowUps VALUES (1,1,3,60.5,22.2,'{"cintura":70,"cadera":95,"brazo":28}',75.0,'Reducción de harinas refinadas','Bajar 2kg adicionales en 6 semanas','2026-03-01')`,
    `INSERT OR IGNORE INTO NutritionalFollowUps VALUES (2,1,NULL,59.0,21.8,'{"cintura":68,"cadera":93,"brazo":27}',85.0,'Incremento de proteína en cena','Mantener peso y mejorar composición','2026-04-01')`,
    `INSERT OR IGNORE INTO NutritionalFollowUps VALUES (3,2,NULL,76.5,17.8,'{"cintura":84,"cadera":98,"brazo":35}',90.0,'Aumento de carbohidratos en pre-entreno','Continuar con plan actual','2026-03-05')`,
    `INSERT OR IGNORE INTO NutritionalFollowUps VALUES (4,3,NULL,58.0,23.0,'{"cintura":62,"cadera":88,"brazo":25}',60.0,'Se agregaron legumbres diarias','Aumentar 1kg más en 4 semanas','2026-03-10')`,
  ]);

  // ── 14. NUTRITIONAL DISCHARGES ────────────────────────────────────────
  console.log('🏁 NutritionalDischarges...');
  await db.batch([
    "INSERT OR IGNORE INTO NutritionalDischarges VALUES (1,1,1,58.0,90,'Mantener dieta mediterránea, actividad física 4x semana','Cumplimiento','2026-04-15')",
  ]);

  // ── 15. COLLABORATIVE NOTES ───────────────────────────────────────────
  console.log('📒 CollaborativeNotes...');
  await db.batch([
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (1,7,3,'Paciente presenta buena adherencia al tratamiento antihipertensivo. Se recomienda control en 30 días.',0,'','2026-01-10 10:30:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (2,8,5,'Paciente con historial de migraña recurrente. Evitar AINES. Verificar alergias antes de prescribir.',1,'Dolor crónico','2026-02-05 11:00:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (3,9,4,'Paciente vegetariana estricta. Niveles de B12 bajos confirmados en laboratorio. Iniciar suplementación.',1,'Lesión muscular,Rehabilitación','2026-01-25 12:00:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (4,10,3,'Paciente con obesidad grado II y resistencia a la insulina. Requiere seguimiento multidisciplinario urgente.',1,'Post-cirugía','2026-02-10 09:00:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (5,12,13,'Atleta con esguince de tobillo grado II. No apto para competencia por 6 semanas. Plan de rehabilitación iniciado.',0,'','2026-01-30 08:45:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (6,11,6,'Paciente con ansiedad alimentaria detectada. Se sugiere valoración psicológica adicional.',0,'','2026-02-20 14:30:00')",
    "INSERT OR IGNORE INTO CollaborativeNotes VALUES (7,7,6,'Revisión de plan nutricional. Paciente refiere dificultad para seguir menú en fines de semana. Ajuste realizado.',0,'','2026-03-01 10:00:00')",
  ]);

  console.log('\n✅ Seed complete! All tables populated.');
  console.log('\n📌 Demo credentials:');
  console.log('   Admin:    admin@demo.com    / admin123');
  console.log('   Doctor:   doctor@demo.com   / doctor123');
  console.log('   Paciente: patient@demo.com  / patient123');
  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });