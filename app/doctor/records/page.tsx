'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Eye, Edit2, User,
  Calendar, Stethoscope, Pill, ClipboardList, Check, X,
} from 'lucide-react';
import Modal from '@/app/components/ui/Modal';

// ── Types ─────────────────────────────────────────────────────────────
interface Consultation {
  consultationId:   number;
  appointmentId:    number;
  diagnosis:        string;
  symptoms:         string;
  consultationDate: string;
  patientName:      string;
  patientId:        number;
}

interface Patient { userId: number; firstName: string; lastName: string; }

type RecordForm = {
  patientId:        string;
  consultationDate: string;
  diagnosis:        string;
  symptomsRaw:      string;
  prescRaw:         string;
  notes:            string;
};

const EMPTY_FORM: RecordForm = {
  patientId:        '',
  consultationDate: new Date().toISOString().split('T')[0],
  diagnosis:        '',
  symptomsRaw:      '',
  prescRaw:         '',
  notes:            '',
};

// ── Helpers ───────────────────────────────────────────────────────────
function getDoctorId() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
  try { return JSON.parse(decodeURIComponent(raw ?? '')).userId; } catch { return 2; }
}

// ── Shared input style ────────────────────────────────────────────────
const lbl = 'input-label';
const inp = 'input-field';

// ── Sub-components defined OUTSIDE main to prevent focus loss ─────────

function InfoChip({ text }: { text: string }) {
  return (
    <span className="badge-gray text-[11px]">{text}</span>
  );
}

function RecordCard({
  con,
  onView,
  onEdit,
}: {
  con: Consultation;
  onView: (c: Consultation) => void;
  onEdit: (c: Consultation) => void;
}) {
  const symptoms = con.symptoms ? con.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="section-card overflow-hidden">
      <div className="h-0.5 bg-blue-500" />
      <div className="flex items-start gap-4 p-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-base">
          {con.patientName?.[0] ?? '?'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{con.diagnosis}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{con.patientName}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{con.consultationDate}</span>
          </div>
          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {symptoms.slice(0, 4).map((s, i) => <InfoChip key={i} text={s} />)}
              {symptoms.length > 4 && <span className="text-xs text-slate-400">+{symptoms.length - 4}</span>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onView(con)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-3 h-3" /> Ver
          </button>
          <button
            onClick={() => onEdit(con)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border-0 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form fields ───────────────────────────────────────────────────────
function RecordFormFields({
  form,
  patients,
  onChange,
}: {
  form: RecordForm;
  patients: Patient[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Paciente *</label>
          <select className={inp} name="patientId" value={form.patientId} onChange={onChange} required>
            <option value="">Seleccionar...</option>
            {patients.map(p => (
              <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Fecha de consulta</label>
          <input className={inp} type="date" name="consultationDate" value={form.consultationDate} onChange={onChange} />
        </div>
      </div>

      <div>
        <label className={lbl}>Diagnóstico *</label>
        <input className={inp} name="diagnosis" value={form.diagnosis} onChange={onChange} placeholder="Diagnóstico principal..." autoComplete="off" required />
      </div>

      <div>
        <label className={lbl}>Síntomas <span className="text-slate-400 font-normal">(separados por coma)</span></label>
        <input className={inp} name="symptomsRaw" value={form.symptomsRaw} onChange={onChange} placeholder="Cefalea, Fiebre, Náuseas..." autoComplete="off" />
      </div>

      <div>
        <label className={lbl}>Prescripción <span className="text-slate-400 font-normal">(separada por coma)</span></label>
        <textarea className={`${inp} resize-none`} rows={2} name="prescRaw" value={form.prescRaw} onChange={onChange} placeholder="Paracetamol 500mg cada 8h, Ibuprofeno 400mg..." />
        <p className="text-xs text-slate-400 mt-1">Cada medicamento separado por coma</p>
      </div>

      <div>
        <label className={lbl}>Notas clínicas</label>
        <textarea className={`${inp} resize-none`} rows={3} name="notes" value={form.notes} onChange={onChange} placeholder="Observaciones, evolución del paciente..." />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function DoctorRecords() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients,      setPatients]      = useState<Patient[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [addOpen,       setAddOpen]       = useState(false);
  const [viewRecord,    setViewRecord]    = useState<Consultation | null>(null);
  const [editRecord,    setEditRecord]    = useState<Consultation | null>(null);
  const [form,          setForm]          = useState<RecordForm>(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);

  const reload = useCallback(async () => {
    const doctorId = getDoctorId();
    const [recRes, docRes] = await Promise.all([
      fetch(`/api/records?doctorId=${doctorId}`).then(r => r.json()),
      fetch(`/api/doctor?doctorId=${doctorId}`).then(r => r.json()),
    ]);
    setConsultations(recRes.consultations ?? []);
    setPatients(docRes.patients ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = consultations.filter(c =>
    c.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    (c.symptoms ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const openEdit = (con: Consultation) => {
    setForm({
      patientId:        String(con.patientId),
      consultationDate: con.consultationDate,
      diagnosis:        con.diagnosis,
      symptomsRaw:      con.symptoms ?? '',
      prescRaw:         '',
      notes:            '',
    });
    setEditRecord(con);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis.trim()) return;
    setSaving(true);
    await fetch('/api/records', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, doctorId: getDoctorId() }),
    });
    setSaving(false);
    setAddOpen(false);
    setForm(EMPTY_FORM);
    reload();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord || !form.diagnosis.trim()) return;
    setSaving(true);
    await fetch('/api/records', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ consultationId: editRecord.consultationId, ...form }),
    });
    setSaving(false);
    setEditRecord(null);
    reload();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Expedientes Médicos</h1>
          <p className="page-subtitle">{consultations.length} expedientes registrados</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Nuevo Expediente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input-field pl-9"
          placeholder="Buscar diagnóstico, paciente o síntoma..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card p-12 text-center">
          <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">
            {search ? 'No hay expedientes que coincidan' : 'No hay expedientes registrados aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered
            .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate))
            .map(con => (
              <RecordCard key={con.consultationId} con={con} onView={setViewRecord} onEdit={openEdit} />
            ))}
        </div>
      )}

      {/* ── ADD Modal ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Nuevo Expediente Médico" subtitle="Será visible en el perfil del paciente" size="lg">
        <form onSubmit={handleAdd}>
          <RecordFormFields form={form} patients={patients} onChange={handleChange} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.patientId || !form.diagnosis.trim()}>
              {saving
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus className="w-3.5 h-3.5" />}
              Agregar Expediente
            </button>
          </div>
        </form>
      </Modal>

      {/* ── VIEW Modal ── */}
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="Expediente Médico" size="lg">
        {viewRecord && (
          <div className="space-y-4">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {viewRecord.patientName?.[0]}
                </div>
                <div>
                  <p className="font-bold">{viewRecord.patientName}</p>
                  <p className="text-slate-300 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{viewRecord.consultationDate}
                  </p>
                </div>
              </div>
              {/* Diagnosis */}
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-200 font-semibold uppercase tracking-wide mb-0.5">Diagnóstico</p>
                <p className="font-semibold">{viewRecord.diagnosis}</p>
              </div>
            </div>

            {/* Symptoms */}
            {viewRecord.symptoms && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Síntomas
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewRecord.symptoms.split(',').map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-medium">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button className="btn-secondary" onClick={() => setViewRecord(null)}>Cerrar</button>
              <button
                className="btn-primary"
                onClick={() => { openEdit(viewRecord); setViewRecord(null); }}
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── EDIT Modal ── */}
      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="Editar Expediente" size="lg">
        {editRecord && (
          <form onSubmit={handleUpdate}>
            <RecordFormFields form={form} patients={patients} onChange={handleChange} />
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
              <button type="button" className="btn-secondary" onClick={() => setEditRecord(null)}>
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving || !form.diagnosis.trim()}>
                {saving
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check className="w-3.5 h-3.5" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}