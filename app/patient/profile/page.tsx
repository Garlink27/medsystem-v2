'use client';

import { useState, useEffect } from 'react';
import {
  Edit2, Check, X, User, Phone, Heart,
  AlertTriangle, Droplets, Activity,
} from 'lucide-react';
import type { Patient, BloodType, SchoolLevel, UpdatePatientInput } from '@/app/types';

const BLOOD_TYPES: BloodType[]     = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SCHOOL_LEVELS: SchoolLevel[] = ['Primaria', 'Secundaria', 'Preparatoria', 'Universidad'];

type Section = 'personal' | 'medical' | null;

// ── Defined OUTSIDE the main component ───────────────────────────────
// If defined inside, React remounts them on every state change,
// destroying the input and losing focus on every keystroke.

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#94a3b8', flexShrink: 0 }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  );
}

function ProfileCard({
  title, icon, accentColor, section, editing, onEdit, onCancel, saving, children,
}: {
  title:       string;
  icon:        React.ReactNode;
  accentColor: string;
  section:     Section;
  editing:     Section;
  onEdit:      () => void;
  onCancel:    () => void;
  saving:      boolean;
  children:    React.ReactNode;
}) {
  const isEditing = editing === section;
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ height: 3, background: accentColor }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>{title}</span>
        </div>
        {!isEditing && (
          <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Edit2 className="w-3 h-3" /> Editar
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button form={`form-${section}`} type="submit" disabled={saving} className="btn-primary text-xs px-3 py-1">
              {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
              Guardar
            </button>
          </div>
        )}
      </div>
      <div style={{ padding: '0 1.25rem 1.25rem' }}>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function PatientProfile() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Section>(null);
  const [form,    setForm]    = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const getPatientId = (): number => {
    const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
    try { return JSON.parse(decodeURIComponent(raw ?? '')).userId; } catch { return 1; }
  };

  useEffect(() => {
    fetch(`/api/patient?patientId=${getPatientId()}`)
      .then(r => r.json())
      .then(data => {
        setPatient({ ...data, isAthlete: data.isAthlete === 1 || data.isAthlete === true });
        setLoading(false);
      });
  }, []);

  const age = patient
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : 0;

  const bmi = patient
    ? (patient.weight / patient.height ** 2).toFixed(1)
    : '--';

  const startEdit = (section: Section) => {
    setForm({ ...patient });
    setEditing(section);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/patient', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ patientId: getPatientId(), ...form } as UpdatePatientInput),
    });
    setPatient(prev => prev ? { ...prev, ...form, isAthlete: !!form.isAthlete } : prev);
    setSaving(false);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) return <p className="text-slate-500">No se encontró el perfil.</p>;

  const genderLabel = patient.gender === 'F' ? 'Femenino' : patient.gender === 'M' ? 'Masculino' : 'Otro';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>

      {saved && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl text-sm font-semibold">
          <Check className="w-4 h-4" /> Cambios guardados
        </div>
      )}

      <div>
        <h1 className="page-title">Mi Perfil</h1>
        <p className="page-subtitle">Gestiona tu información personal y médica</p>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {patient.firstName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>{patient.firstName} {patient.lastName}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: '2px 0 8px' }}>{patient.email}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>🎓 {patient.schoolLevel}</span>
            {patient.isAthlete && (
              <span style={{ fontSize: 11, padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>🏃 Atleta</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.75rem 1.25rem', flexShrink: 0 }}>
          {[{ label: 'Edad', value: `${age}a` }, { label: 'Sangre', value: patient.bloodType }, { label: 'IMC', value: bmi }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        <ProfileCard title="Información Personal" accentColor="#2563eb" section="personal"
          editing={editing} onEdit={() => startEdit('personal')} onCancel={() => setEditing(null)} saving={saving}
          icon={<User style={{ width: 16, height: 16, color: '#2563eb' }} />}>
          {editing === 'personal' ? (
            <form id="form-personal" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="input-label">Nombre</label>
                  <input className="input-field" name="firstName" value={form.firstName ?? ''} onChange={handleChange} autoComplete="off" />
                </div>
                <div>
                  <label className="input-label">Apellido</label>
                  <input className="input-field" name="lastName" value={form.lastName ?? ''} onChange={handleChange} autoComplete="off" />
                </div>
              </div>
              <div>
                <label className="input-label">Email</label>
                <input className="input-field" type="email" name="email" value={form.email ?? ''} onChange={handleChange} autoComplete="off" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="input-label">Género</label>
                  <select className="input-field" name="gender" value={form.gender ?? 'F'} onChange={handleChange}>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Nivel Escolar</label>
                  <select className="input-field" name="schoolLevel" value={form.schoolLevel ?? ''} onChange={handleChange}>
                    {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <>
              <InfoRow label="Nombre"        value={`${patient.firstName} ${patient.lastName}`} icon={<User className="w-3 h-3" />} />
              <InfoRow label="Email"         value={patient.email} icon={<Phone className="w-3 h-3" />} />
              <InfoRow label="Fecha Nac."    value={new Date(patient.dateOfBirth).toLocaleDateString('es-MX')} />
              <InfoRow label="Edad"          value={`${age} años`} />
              <InfoRow label="Género"        value={genderLabel} />
              <InfoRow label="Nivel Escolar" value={patient.schoolLevel} />
            </>
          )}
        </ProfileCard>

        <ProfileCard title="Información Médica" accentColor="#dc2626" section="medical"
          editing={editing} onEdit={() => startEdit('medical')} onCancel={() => setEditing(null)} saving={saving}
          icon={<Heart style={{ width: 16, height: 16, color: '#dc2626' }} />}>
          {editing === 'medical' ? (
            <form id="form-medical" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="input-label">Tipo de Sangre</label>
                  <select className="input-field" name="bloodType" value={form.bloodType ?? ''} onChange={handleChange}>
                    {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Peso (kg)</label>
                  <input className="input-field" type="number" step="0.1" name="weight" value={String(form.weight ?? '')} onChange={handleChange} />
                </div>
                <div>
                  <label className="input-label">Altura (m)</label>
                  <input className="input-field" type="number" step="0.01" name="height" value={String(form.height ?? '')} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="input-label">Alergias</label>
                <input className="input-field" name="allergies" value={form.allergies ?? ''} onChange={handleChange} placeholder="Ej. Penicilina, Polen..." autoComplete="off" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" name="isAthlete" checked={!!form.isAthlete} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                Soy atleta / deportista
              </label>
            </form>
          ) : (
            <>
              <InfoRow label="Tipo de Sangre" value={patient.bloodType} icon={<Droplets className="w-3 h-3 text-red-500" />} />
              <InfoRow label="Peso"           value={`${patient.weight} kg`} />
              <InfoRow label="Altura"         value={`${patient.height} m`} />
              <InfoRow label="IMC"            value={bmi} icon={<Activity className="w-3 h-3" />} />
              <InfoRow label="Atleta"         value={patient.isAthlete ? 'Sí' : 'No'} />
              {patient.allergies && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.625rem', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <AlertTriangle style={{ width: 14, height: 14, color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 2 }}>Alergias</p>
                    <p style={{ fontSize: '0.8125rem', color: '#78350f' }}>{patient.allergies}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}