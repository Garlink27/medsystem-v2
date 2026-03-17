'use client';

import { useState, useEffect } from 'react';
import { Plus, Salad, Search, User, Scale, Target, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';

interface NutriProfile {
  profileId:            number;
  patientId:            number;
  patientName:          string;
  waistCircumference:   number;
  bodyFatPercentage:    number;
  physicalActivityLevel:string;
  nutritionalDiagnosis: string;
  metabolicRisk:        string;
  nutritionalObjective: string;
  waterConsumptionLiters: number;
  createdAt:            string;
}

interface PatientRow { userId: number; firstName: string; lastName: string; }

type DiagnosisType = 'Normal' | 'Sobrepeso' | 'Obesidad' | 'Bajo peso';

const DIAGNOSIS_BADGE: Record<DiagnosisType, string> = {
  Normal:      'badge-success',
  Sobrepeso:   'badge-warning',
  Obesidad:    'badge-danger',
  'Bajo peso': 'badge-purple',
};

const ACTIVITY_LEVELS = ['Sedentario', 'Ligero', 'Moderado', 'Intenso', 'Muy intenso'];

type ProfileForm = {
  patientId:            string;
  waistCircumference:   string;
  bodyFatPercentage:    string;
  physicalActivityLevel:string;
  nutritionalDiagnosis: DiagnosisType | '';
  metabolicRisk:        string;
  nutritionalObjective: string;
  waterConsumptionLiters: string;
  dietaryHabits:        string;
  familyHistory:        string;
};

const EMPTY_FORM: ProfileForm = {
  patientId: '', waistCircumference: '', bodyFatPercentage: '',
  physicalActivityLevel: 'Moderado', nutritionalDiagnosis: '',
  metabolicRisk: '', nutritionalObjective: '', waterConsumptionLiters: '',
  dietaryHabits: '', familyHistory: '',
};

function getDoctorId() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
  try { return JSON.parse(decodeURIComponent(raw ?? '')).userId; } catch { return 2; }
}

export default function DoctorNutrition() {
  const [profiles, setProfiles] = useState<NutriProfile[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form,     setForm]     = useState<ProfileForm>(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const reload = async () => {
    const [nutrRes, docRes] = await Promise.all([
      fetch('/api/nutrition').then(r => r.json()),
      fetch(`/api/doctor?doctorId=${getDoctorId()}`).then(r => r.json()),
    ]);
    setProfiles(nutrRes.profiles ?? []);
    setPatients(docRes.patients ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []); // eslint-disable-line

  const filtered = profiles.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    (p.nutritionalDiagnosis ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return;
    setSaving(true);
    await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, nutritionistId: getDoctorId() }),
    });
    setSaving(false);
    setModal(false);
    setForm(EMPTY_FORM);
    reload();
  };

  const diagCounts = profiles.reduce<Record<string, number>>((a, p) => {
    const d = p.nutritionalDiagnosis ?? 'Sin diagnóstico';
    a[d] = (a[d] ?? 0) + 1;
    return a;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Nutrición</h1>
          <p className="page-subtitle">Fichas nutricionales y seguimiento de pacientes</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setModal(true); }}>
          <Plus className="w-4 h-4" /> Nueva Ficha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fichas', value: profiles.length,                                    icon: Salad,         color: 'text-emerald-600',bg: 'bg-emerald-50'},
          { label: 'Normal',       value: diagCounts['Normal'] ?? 0,                          icon: Target,        color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Sobrepeso',    value: (diagCounts['Sobrepeso'] ?? 0) + (diagCounts['Obesidad'] ?? 0), icon: Scale, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Bajo Peso',    value: diagCounts['Bajo peso'] ?? 0,                       icon: AlertCircle,   color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input-field pl-9" placeholder="Buscar paciente o diagnóstico..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Profiles */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Salad className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay fichas nutricionales registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(profile => {
            const diag  = (profile.nutritionalDiagnosis ?? '') as DiagnosisType;
            const badge = DIAGNOSIS_BADGE[diag] ?? 'badge-gray';
            const open  = expanded === profile.profileId;

            return (
              <div key={profile.profileId} className="section-card overflow-hidden">
                <div className="h-0.5 bg-emerald-500" />
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(open ? null : profile.profileId)}
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Salad className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{profile.patientName}</p>
                      {diag && <span className={badge}>{diag}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Actividad: {profile.physicalActivityLevel ?? 'N/A'} · Agua: {profile.waterConsumptionLiters ?? '—'} L/día
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {profile.metabolicRisk && (
                      <span className="badge-warning text-[10px]">⚠ {profile.metabolicRisk}</span>
                    )}
                    {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Medidas</p>
                      {[
                        { label: 'Cintura', value: profile.waistCircumference ? `${profile.waistCircumference} cm` : '—' },
                        { label: '% Grasa', value: profile.bodyFatPercentage  ? `${profile.bodyFatPercentage}%`  : '—' },
                        { label: 'Agua',    value: profile.waterConsumptionLiters ? `${profile.waterConsumptionLiters} L` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0 text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-medium text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Objetivos</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{profile.nutritionalObjective ?? 'Sin objetivo registrado'}</p>
                      {profile.metabolicRisk && (
                        <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">Riesgo metabólico: {profile.metabolicRisk}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nueva Ficha Nutricional" subtitle="Registra el perfil inicial del paciente" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Patient */}
          <div>
            <label className="input-label">Paciente *</label>
            <select className="input-field" name="patientId" value={form.patientId} onChange={handleChange} required>
              <option value="">Seleccionar paciente...</option>
              {patients.map(p => (
                <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Cintura (cm)</label>
              <input className="input-field" type="number" step="0.1" name="waistCircumference" value={form.waistCircumference} onChange={handleChange} placeholder="82.5" />
            </div>
            <div>
              <label className="input-label">% Grasa corporal</label>
              <input className="input-field" type="number" step="0.1" name="bodyFatPercentage" value={form.bodyFatPercentage} onChange={handleChange} placeholder="22.0" />
            </div>
            <div>
              <label className="input-label">Agua (L/día)</label>
              <input className="input-field" type="number" step="0.1" name="waterConsumptionLiters" value={form.waterConsumptionLiters} onChange={handleChange} placeholder="2.0" />
            </div>
            <div>
              <label className="input-label">Nivel de actividad</label>
              <select className="input-field" name="physicalActivityLevel" value={form.physicalActivityLevel} onChange={handleChange}>
                {ACTIVITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Diagnóstico nutricional</label>
              <select className="input-field" name="nutritionalDiagnosis" value={form.nutritionalDiagnosis} onChange={handleChange}>
                <option value="">Sin diagnóstico</option>
                {(['Normal', 'Sobrepeso', 'Obesidad', 'Bajo peso'] as DiagnosisType[]).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Riesgo metabólico</label>
              <input className="input-field" name="metabolicRisk" value={form.metabolicRisk} onChange={handleChange} placeholder="Ej. Alto, Moderado" />
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="input-label">Objetivo nutricional</label>
            <textarea className="input-field resize-none" rows={2} name="nutritionalObjective" value={form.nutritionalObjective} onChange={handleChange} placeholder="Reducir peso corporal, mejorar hábitos alimenticios..." />
          </div>

          {/* Habits */}
          <div>
            <label className="input-label">Hábitos alimenticios</label>
            <textarea className="input-field resize-none" rows={2} name="dietaryHabits" value={form.dietaryHabits} onChange={handleChange} placeholder="Descripción de hábitos, horarios, preferencias..." />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.patientId}>
              {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Guardar Ficha
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
