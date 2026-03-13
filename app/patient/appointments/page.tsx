'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Calendar, Clock, Edit2, XCircle, CheckCircle, Clock3, XOctagon } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';
import type { Appointment, AppointmentStatus, CreateAppointmentInput, UpdateAppointmentInput } from '@/app/types';

// ── Status config — mirrors DB CHECK constraint values ────────────────
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  Pendiente:  { label: 'Pendiente',  badge: 'badge-warning', icon: <Clock3    className="w-3 h-3" /> },
  Aceptada:   { label: 'Aceptada',   badge: 'badge-success', icon: <CheckCircle className="w-3 h-3" /> },
  Completada: { label: 'Completada', badge: 'badge-sky',     icon: <CheckCircle className="w-3 h-3" /> },
  Cancelada:  { label: 'Cancelada',  badge: 'badge-danger',  icon: <XOctagon  className="w-3 h-3" /> },
  Denegada:   { label: 'Denegada',   badge: 'badge-purple',  icon: <XCircle   className="w-3 h-3" /> },
};

type FilterVal = 'Todas' | AppointmentStatus;

const FILTERS: { value: FilterVal; badge?: string }[] = [
  { value: 'Todas' },
  { value: 'Aceptada',   badge: 'badge-success' },
  { value: 'Pendiente',  badge: 'badge-warning' },
  { value: 'Completada', badge: 'badge-sky'     },
  { value: 'Cancelada',  badge: 'badge-danger'  },
  { value: 'Denegada',   badge: 'badge-purple'  },
];

// Doctors list — in production fetch from /api/doctors
const DOCTORS = [
  { doctorId: 2, name: 'Dr. Carlos Ramírez',  specialty: 'Cardiología'      },
  { doctorId: 3, name: 'Dra. Ana López',       specialty: 'Medicina General' },
];

type AptForm = { doctorId: string; dateTime: string; };
const EMPTY_FORM: AptForm = { doctorId: '2', dateTime: '' };

export default function PatientAppointments() {
  const [apts,        setApts]        = useState<Appointment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<FilterVal>('Todas');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingApt,  setEditingApt]  = useState<Appointment | null>(null);
  const [cancelId,    setCancelId]    = useState<number | null>(null);
  const [form,        setForm]        = useState<AptForm>(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);

  // ── Read patientId from cookie (client-side) ──
  const getPatientId = (): number => {
    const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
    if (!raw) return 1;
    try { return JSON.parse(decodeURIComponent(raw)).userId; } catch { return 1; }
  };

  const loadApts = useCallback(async () => {
    setLoading(true);
    const id = getPatientId();
    const res = await fetch(`/api/appointments?patientId=${id}`);
    const data = await res.json();
    setApts(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadApts(); }, [loadApts]);

  const filtered = filter === 'Todas' ? apts : apts.filter(a => a.status === filter);

  // ── Helpers ──
  const openNew = () => { setEditingApt(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setForm({ doctorId: String(apt.doctorId), dateTime: apt.dateTime.replace(' ', 'T').slice(0, 16) });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingApt) {
      const body: UpdateAppointmentInput = {
        appointmentId: editingApt.appointmentId,
        dateTime: form.dateTime,
      };
      await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      const body: CreateAppointmentInput = {
        patientId: getPatientId(),
        doctorId:  Number(form.doctorId),
        dateTime:  form.dateTime.replace('T', ' '),
      };
      await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }

    setSaving(false);
    setModalOpen(false);
    loadApts();
  };

  const handleCancel = async () => {
    if (cancelId === null) return;
    await fetch(`/api/appointments?appointmentId=${cancelId}`, { method: 'DELETE' });
    setConfirmOpen(false);
    setCancelId(null);
    loadApts();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Mis Citas</h1>
          <p className="page-subtitle">{apts.length} citas en total</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus className="w-4 h-4" /> Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {FILTERS.map(f => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={[
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border',
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {f.value !== 'Todas' && STATUS_CONFIG[f.value as AppointmentStatus]?.icon}
              {f.value}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="section-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay citas con este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => {
            const d    = new Date(apt.dateTime);
            const sc   = STATUS_CONFIG[apt.status];
            const canEdit   = apt.status === 'Pendiente';
            const canCancel = apt.status === 'Pendiente' || apt.status === 'Aceptada';

            return (
              <div key={apt.appointmentId} className="section-card overflow-hidden">
                {/* Accent bar */}
                <div className={[
                  'h-0.5',
                  apt.status === 'Aceptada'   ? 'bg-emerald-400' :
                  apt.status === 'Pendiente'  ? 'bg-amber-400'   :
                  apt.status === 'Completada' ? 'bg-sky-400'     :
                  apt.status === 'Cancelada'  ? 'bg-red-400'     : 'bg-violet-400',
                ].join(' ')} />

                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Date badge */}
                  <div className="w-14 flex-shrink-0 flex flex-col items-center bg-slate-50 border border-slate-100 rounded-xl py-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {d.toLocaleString('es-MX', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{d.getDate()}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{apt.doctorName}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {apt.consultation && (
                      <p className="text-xs text-slate-400 mt-1 truncate italic">{apt.consultation.diagnosis}</p>
                    )}
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`${sc?.badge ?? 'badge-gray'} flex items-center gap-1`}>
                      {sc?.icon} {sc?.label}
                    </span>
                    {(canEdit || canCancel) && (
                      <div className="flex gap-1.5">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(apt)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Editar
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => { setCancelId(apt.appointmentId); setConfirmOpen(true); }}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Cancelar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApt ? 'Editar Cita' : 'Nueva Cita'}
        subtitle={editingApt ? 'Modifica la fecha o el doctor' : 'Agenda una nueva cita médica'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="input-label">Doctor</label>
            <select
              className="input-field"
              value={form.doctorId}
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
            >
              {DOCTORS.map(d => (
                <option key={d.doctorId} value={d.doctorId}>
                  {d.name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Fecha y hora</label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.dateTime}
              onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !form.dateTime}>
              {saving ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : editingApt ? 'Guardar Cambios' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm cancel ── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="¿Cancelar esta cita?"
        message="Esta acción marcará la cita como Cancelada. No se puede deshacer."
        onConfirm={handleCancel}
        onCancel={() => { setConfirmOpen(false); setCancelId(null); }}
        danger
      />
    </div>
  );
}
