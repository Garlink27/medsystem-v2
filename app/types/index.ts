// ── Aligned with DB schema ────────────────────────────────────────────

export type RoleName =
  | 'Administrador' | 'Jefe Médico' | 'Doctor'
  | 'Nutriólogo'    | 'Estudiante'  | 'Staff' | 'Entrenador';

export type AppointmentStatus =
  | 'Pendiente' | 'Aceptada' | 'Completada' | 'Cancelada' | 'Denegada';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type SchoolLevel = 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Universidad';

export type NutritionalDiagnosis = 'Sobrepeso' | 'Obesidad' | 'Bajo peso' | 'Normal';

export type ClinicalFileType =
  | 'Rayos X' | 'Resultados de Laboratorio'
  | 'PDF Receta' | 'PDF Plan Nutricional' | 'PDF Reporte Integral';

// ── DB row shapes (returned from Turso) ──────────────────────────────

export interface User {
  userId:    number;
  firstName: string;
  lastName:  string;
  email:     string;
  roleId:    number;
  roleName?: RoleName;
}

export interface Patient {
  patientId:   number;
  firstName:   string;
  lastName:    string;
  email:       string;
  dateOfBirth: string;
  gender:      'M' | 'F' | 'O';
  bloodType:   BloodType;
  allergies:   string;
  weight:      number;
  height:      number;
  isAthlete:   boolean;
  schoolLevel: SchoolLevel;
}

export interface Appointment {
  appointmentId:   number;
  patientId:       number;
  doctorId:        number;
  dateTime:        string;
  status:          AppointmentStatus;
  // Joined fields
  doctorName?:     string;
  doctorSpecialty?: string;
  consultation?:   Consultation;
}

export interface Consultation {
  consultationId:   number;
  appointmentId:    number;
  diagnosis:        string;
  symptoms:         string;
  consultationDate: string;
  prescriptions?:   Prescription[];
  files?:           ClinicalFile[];
}

export interface Prescription {
  prescriptionId:  number;
  consultationId:  number;
  medicationId:    number;
  dosage:          string;
  frequency:       string;
  duration:        string;
  brandName?:      string;
  activeIngredient?: string;
}

export interface ClinicalFile {
  fileId:        number;
  consultationId:number;
  fileType:      ClinicalFileType;
  fileUrl:       string;
}

// ── Form / API input types ────────────────────────────────────────────

export interface LoginInput {
  email:    string;
  password: string;
}

export interface CreateAppointmentInput {
  patientId: number;
  doctorId:  number;
  dateTime:  string;
}

export interface UpdateAppointmentInput {
  appointmentId: number;
  status?:       AppointmentStatus;
  dateTime?:     string;
}

export interface UpdatePatientInput {
  patientId:   number;
  firstName?:  string;
  lastName?:   string;
  email?:      string;
  dateOfBirth?: string;
  gender?:     'M' | 'F' | 'O';
  bloodType?:  BloodType;
  allergies?:  string;
  weight?:     number;
  height?:     number;
  isAthlete?:  boolean;
  schoolLevel?: SchoolLevel;
}
