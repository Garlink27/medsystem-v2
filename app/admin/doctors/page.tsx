// app/admin/doctors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Stethoscope, Users, Calendar, ClipboardList,
  Plus, Eye, X, Check, Mail, Hash, TrendingUp,
} from 'lucide-react';
import Modal from '@/app/components/ui/Modal';

// ── Types ──────────────────────────────────────────────────────────────
interface Doctor {
  userId:         number;
  firstName:      string;
  lastName:       string;
  email:          string;
  roleName:       string;
  patientCount:   number;
  aptCount:       number;
  completedCount: number;
}

type NewDoctorForm = {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  roleName:  string;
};

const EMPTY_FORM: NewDoctorForm = {
  firstName: '',
  lastName:  '',
  email:     '',
  password:  '',
  roleName:  'Doctor',
};

// ── Style maps ─────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, string> = {
  Doctor:        'badge-info',
  'Jefe Médico': 'badge-purple',
  Nutriólogo:    'badge-warning',
  Entrenador:    'badge-success',
};

const ROLE_BG: Record<string, string> = {
  Doctor:        'bg-blue-600',
  'Jefe Médico': 'bg-purple-600',
  Nutriólogo:    'bg-orange-500',
  Entrenador:    'bg-cyan-600',
};

const ROLE_GRADIENT: Record<string, string> = {
  Doctor:        'from-blue-700 to-blue-900',
  'Jefe Médico': 'from-purple-700 to-purple-900',
  Nutriólogo:    'from-orange-600 to-orange-800',
  Entrenador:    'from-cyan-600 to-cyan-800',
};

const ROLES = ['Doctor', 'Jefe Médico', 'Nutriólogo', 'Entrenador'];

// ── Main component ─────────────────────────────────────────────────────
export default function AdminDoctors() {
  const [doctors,    setDoctors]    = useState<Doctor[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<Doctor | null>(null);
  const [addOpen,    setAddOpen]    = useState(false);
  const [form,       setForm]       = useState<NewDoctorForm>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [savedMsg,   setSavedMsg]   = useState(false);
  const [error,      setError]      = useState('');

  const load = async () => {
    setLoading(true);
    const res  = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data.doctors ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/doctors', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Error al crear doctor'); return; }
    setAddOpen(false);
    setForm(EMPTY_FORM);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
    load();
  };

  return (
    <div className="space-y-6">

      {/* Success toast */}
      {savedMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl text-sm font-semibold">
          <Check className="w-4 h-4" /> Doctor agregado correctamente
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Gestión de Doctores</h1>
          <p className="page-subtitle">{doctors.length} médicos registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setError(''); setAddOpen(true); }}>
          <Plus className="w-4 h-4" /> Nuevo Doctor
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay médicos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map(doc => {
            const bg             = ROLE_BG[doc.roleName]    ?? 'bg-slate-600';
            const badge          = ROLE_BADGE[doc.roleName] ?? 'badge-gray';
            const initial        = doc.firstName[0]?.toUpperCase() ?? '?';
            const completionRate = doc.aptCount > 0
              ? Math.round((doc.completedCount / doc.aptCount) * 100)
              : 0;

            return (
              <div key={doc.userId} className="section-card hover:shadow-lg transition-shadow overflow-hidden">
                {/* Top accent */}
                <div className={`h-1 ${bg}`} />
                <div className="p-5">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-slate-900 leading-tight">
                          {doc.firstName} {doc.lastName}
                        </h3>
                        <span className={badge}>{doc.roleName}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{doc.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-0.5">
                        <Users className="w-3 h-3 text-blue-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{doc.patientCount}</p>
                      <p className="text-[10px] text-slate-500">Pacientes</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-0.5">
                        <Calendar className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{doc.aptCount}</p>
                      <p className="text-[10px] text-slate-500">Citas</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-0.5">
                        <ClipboardList className="w-3 h-3 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{completionRate}%</p>
                      <p className="text-[10px] text-slate-500">Completadas</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelected(doc)}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle del Médico"
        size="md"
      >
        {selected && (() => {
          const gradient     = ROLE_GRADIENT[selected.roleName] ?? 'from-slate-700 to-slate-900';
          const bg           = ROLE_BG[selected.roleName]       ?? 'bg-slate-600';
          const completionRate = selected.aptCount > 0
            ? Math.round((selected.completedCount / selected.aptCount) * 100)
            : 0;
          const initial = selected.firstName[0]?.toUpperCase() ?? '?';

          return (
            <div className="space-y-4">
              {/* Hero */}
              <div className={`bg-gradient-to-r ${gradient} rounded-xl p-5 text-white flex items-center gap-4`}>
                <div className={`w-16 h-16 rounded-full ${bg} border-2 border-white/30 flex items-center justify-center text-2xl font-bold flex-shrink-0`}>
                  {initial}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selected.firstName} {selected.lastName}</h3>
                  <p className="text-white/70 text-sm">{selected.email}</p>
                  <div className="mt-1.5">
                    <span className="text-[11px] px-2 py-0.5 bg-white/20 rounded-full">
                      {selected.roleName}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-3 bg-white/10 rounded-xl px-4 py-3">
                  {[
                    { label: 'Pacientes', value: selected.patientCount },
                    { label: 'Citas',     value: selected.aptCount     },
                    { label: 'Tasa',      value: `${completionRate}%`  },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-bold text-white text-sm">{s.value}</p>
                      <p className="text-[10px] text-white/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info rows */}
              <div className="section-card">
                <div className="section-card-body space-y-0">
                  {[
                    { icon: <Hash    className="w-3.5 h-3.5 text-slate-400" />, label: 'ID de Usuario',    value: String(selected.userId)      },
                    { icon: <Mail    className="w-3.5 h-3.5 text-slate-400" />, label: 'Correo',           value: selected.email               },
                    { icon: <Stethoscope className="w-3.5 h-3.5 text-slate-400" />, label: 'Rol',          value: selected.roleName            },
                    { icon: <Users   className="w-3.5 h-3.5 text-slate-400" />, label: 'Pacientes únicos', value: String(selected.patientCount) },
                    { icon: <Calendar className="w-3.5 h-3.5 text-slate-400" />, label: 'Total de citas',  value: String(selected.aptCount)    },
                    { icon: <TrendingUp className="w-3.5 h-3.5 text-slate-400" />, label: 'Completadas',   value: String(selected.completedCount) },
                    { icon: <ClipboardList className="w-3.5 h-3.5 text-slate-400" />, label: 'Tasa de completación', value: `${completionRate}%` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        {icon} {label}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button className="btn-secondary" onClick={() => setSelected(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── ADD DOCTOR MODAL ── */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Nuevo Doctor"
        subtitle="Registra un nuevo médico en el sistema"
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Nombre *</label>
              <input
                className="input-field"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Carlos"
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label className="input-label">Apellido *</label>
              <input
                className="input-field"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Ramírez"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Correo electrónico *</label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="doctor@hospital.com"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="input-label">Contraseña *</label>
            <input
              className="input-field"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="input-label">Rol *</label>
            <select
              className="input-field"
              name="roleName"
              value={form.roleName}
              onChange={handleChange}
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !form.firstName || !form.lastName || !form.email || !form.password}
            >
              {saving
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus className="w-3.5 h-3.5" />}
              Agregar Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}