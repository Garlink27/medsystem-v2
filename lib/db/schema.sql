-- Run this in your Turso shell: turso db shell YOUR_DB_NAME < lib/db/schema.sql
-- Or paste each block in the Turso dashboard SQL editor

CREATE TABLE IF NOT EXISTS Roles (
  roleId   INTEGER PRIMARY KEY AUTOINCREMENT,
  roleName TEXT NOT NULL  -- 'Administrador','Jefe Médico','Doctor','Nutriólogo','Estudiante','Staff','Entrenador'
);

CREATE TABLE IF NOT EXISTS Users (
  userId    INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName  TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  password  TEXT NOT NULL,
  roleId    INTEGER NOT NULL REFERENCES Roles(roleId)
);

CREATE TABLE IF NOT EXISTS Patients (
  patientId   INTEGER PRIMARY KEY REFERENCES Users(userId),
  dateOfBirth TEXT,          -- ISO date YYYY-MM-DD
  gender      TEXT,          -- 'M', 'F', 'O'
  bloodType   TEXT,          -- 'O+', 'A-', etc.
  allergies   TEXT,
  weight      REAL,
  height      REAL,
  isAthlete   INTEGER DEFAULT 0,  -- 0=false, 1=true (SQLite has no boolean)
  schoolLevel TEXT               -- 'Primaria','Secundaria','Preparatoria','Universidad'
);

CREATE TABLE IF NOT EXISTS Coach_Athlete (
  coachId   INTEGER NOT NULL REFERENCES Users(userId),
  patientId INTEGER NOT NULL REFERENCES Patients(patientId),
  PRIMARY KEY (coachId, patientId)
);

CREATE TABLE IF NOT EXISTS Appointments (
  appointmentId INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId     INTEGER NOT NULL REFERENCES Patients(patientId),
  doctorId      INTEGER NOT NULL REFERENCES Users(userId),
  dateTime      TEXT NOT NULL,   -- ISO datetime
  status        TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK(status IN ('Pendiente','Aceptada','Completada','Cancelada','Denegada'))
);

CREATE TABLE IF NOT EXISTS Consultations (
  consultationId   INTEGER PRIMARY KEY AUTOINCREMENT,
  appointmentId    INTEGER NOT NULL REFERENCES Appointments(appointmentId),
  diagnosis        TEXT,
  symptoms         TEXT,
  consultationDate TEXT   -- ISO date
);

CREATE TABLE IF NOT EXISTS ClinicalFiles (
  fileId         INTEGER PRIMARY KEY AUTOINCREMENT,
  consultationId INTEGER NOT NULL REFERENCES Consultations(consultationId),
  fileType       TEXT NOT NULL
    CHECK(fileType IN ('Rayos X','Resultados de Laboratorio','PDF Receta','PDF Plan Nutricional','PDF Reporte Integral')),
  fileUrl        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Medications (
  medicationId    INTEGER PRIMARY KEY AUTOINCREMENT,
  brandName       TEXT NOT NULL,
  activeIngredient TEXT,
  presentation    TEXT,          -- 'Tabletas','Jarabe','Pomada'
  currentStock    INTEGER DEFAULT 0,
  reorderPoint    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Batches (
  batchId        INTEGER PRIMARY KEY AUTOINCREMENT,
  medicationId   INTEGER NOT NULL REFERENCES Medications(medicationId),
  quantity       INTEGER,
  entryDate      TEXT,
  expirationDate TEXT
);

CREATE TABLE IF NOT EXISTS Prescriptions (
  prescriptionId INTEGER PRIMARY KEY AUTOINCREMENT,
  consultationId INTEGER NOT NULL REFERENCES Consultations(consultationId),
  medicationId   INTEGER NOT NULL REFERENCES Medications(medicationId),
  dosage         TEXT,
  frequency      TEXT,
  duration       TEXT
);

CREATE TABLE IF NOT EXISTS NutritionalProfiles (
  profileId              INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId              INTEGER NOT NULL UNIQUE REFERENCES Patients(patientId),
  waistCircumference     REAL,
  bodyFatPercentage      REAL,
  physicalActivityLevel  TEXT,
  familyHistory          TEXT,
  dietaryRecall24h       TEXT,
  consumptionFrequency   TEXT,
  dietaryHabits          TEXT,
  mealSchedule           TEXT,
  waterConsumptionLiters REAL,
  nutritionalDiagnosis   TEXT
    CHECK(nutritionalDiagnosis IN ('Sobrepeso','Obesidad','Bajo peso','Normal')),
  metabolicRisk          TEXT,
  nutritionalObjective   TEXT,
  createdAt              TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS NutritionalPlans (
  planId                  INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId               INTEGER NOT NULL REFERENCES Patients(patientId),
  nutritionistId          INTEGER NOT NULL REFERENCES Users(userId),
  caloricRequirement      INTEGER,
  macrosDistribution      TEXT,
  weeklyMenu              TEXT,  -- JSON
  equivalencesList        TEXT,
  generalRecommendations  TEXT,
  pdfUrl                  TEXT,
  patientAccepted         INTEGER DEFAULT 0,
  creationDate            TEXT
);

CREATE TABLE IF NOT EXISTS NutritionalFollowUps (
  followUpId           INTEGER PRIMARY KEY AUTOINCREMENT,
  planId               INTEGER NOT NULL REFERENCES NutritionalPlans(planId),
  consultationId       INTEGER REFERENCES Consultations(consultationId),
  currentWeight        REAL,
  currentBmi           REAL,
  bodyMeasurements     TEXT,  -- JSON
  compliancePercentage REAL,
  adjustmentsMade      TEXT,
  newGoals             TEXT,
  followUpDate         TEXT
);

CREATE TABLE IF NOT EXISTS NutritionalDischarges (
  dischargeId              INTEGER PRIMARY KEY AUTOINCREMENT,
  planId                   INTEGER NOT NULL UNIQUE REFERENCES NutritionalPlans(planId),
  goalReached              INTEGER DEFAULT 0,
  targetWeightAchieved     REAL,
  treatmentDurationDays    INTEGER,
  maintenanceRecommendations TEXT,
  dischargeReason          TEXT CHECK(dischargeReason IN ('Cumplimiento','Abandono')),
  dischargeDate            TEXT
);

CREATE TABLE IF NOT EXISTS CollaborativeNotes (
  noteId      INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId   INTEGER NOT NULL REFERENCES Patients(patientId),
  authorId    INTEGER NOT NULL REFERENCES Users(userId),
  noteContent TEXT,
  isAlert     INTEGER DEFAULT 0,
  alertTags   TEXT,
  createdAt   TEXT DEFAULT (datetime('now'))
);
