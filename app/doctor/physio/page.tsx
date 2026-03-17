'use client';

import { useState, useEffect } from 'react';
import { Plus, Activity, Search, Calendar, User, ClipboardList } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';

interface PhysioNote {
  noteId:      number;
  patientName: string;
  patientId:   number;
  noteContent: string;
  isAlert:     number;
  alertTags:   string;
  createdAt:   string;
}

interface PatientRow { userId: number; firstName: string; lastName: string; }

type NoteForm = { patientId: string; noteContent: string; isAlert: boolean; alertTags: string; };
const EMPTY: NoteForm = { patientId: '', noteContent: '', isAlert: false, alertTags: '' };

const ALERT_TAG_OPTIONS = ['Lesión muscular', 'Dolor crónico', 'Post-cirugía', 'Rehabilitación', 'Riesgo caída'];

function getDoctorId() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
  try { return JSON.parse(decodeURIComponent(raw ?? '')).userId; } catch { return 2; }
}

export default function DoctorPhysio() {
  const [notes,    setNotes]    = useState<PhysioNote[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [confirm,  setConfirm]  = useState<number | null>(null);
  const [form,     setForm]     = useState<NoteForm>(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const reload = async () => {
    const [notesRes, docRes] = await Promise.all([
      fetch('/api/physio').then(r => r.json()),
      fetch(`/api/doctor?doctorId=${getDoctorId()}`).then(r => r.json()),
    ]);
    setNotes(notesRes.notes  ?? []);
    setPatients(docRes.patients ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []); // eslint-disable-line

  const filtered = notes.filter(n =>
    n.patientName.toLowerCase().includes(search.toLowerCase()) ||
    n.noteContent.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.noteContent.trim()) return;
    setSaving(true);
    await fetch('/api/physio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, authorId: getDoctorId() }),
    });
    setSaving(false);
    setModal(false);
    setForm(EMPTY);
    reload();
  };

  const handleDelete = async () => {
    if (confirm === null) return;
    await fetch(`/api/physio?noteId=${confirm}`, { method: 'DELETE' });
    setConfirm(null);
    reload();
  };

  const toggleTag = (tag: string) => {
    setForm(prev => {
      const tags = prev.alertTags ? prev.alertTags.split(',').map(t => t.trim()) : [];
      const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
      return { ...prev, alertTags: next.join(', ') };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Fisioterapia</h1>
          <p className="page-subtitle">Notas colaborativas y seguimiento de rehabilitación</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>
          <Plus className="w-4 h-4" /> Nueva Nota
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Notas',  value: notes.length,                              icon: ClipboardList, color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Con Alerta',   value: notes.filter(n => n.isAlert).length,       icon: Activity,     color: 'text-red-600',    bg: 'bg-red-50'    },
          { label: 'Pacientes',    value: new Set(notes.map(n => n.patientId)).size,  icon: User,         color: 'text-emerald-600',bg: 'bg-emerald-50'},
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
        <input className="input-field pl-9" placeholder="Buscar por paciente o nota..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Activity className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay notas de fisioterapia registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <div key={note.noteId} className={`section-card overflow-hidden ${note.isAlert ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex items-start gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${note.isAlert ? 'bg-red-100' : 'bg-blue-50'}`}>
                  <Activity className={`w-5 h-5 ${note.isAlert ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="font-semibold text-slate-900">{note.patientName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{new Date(note.createdAt).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                        {note.isAlert && <span className="badge-danger text-[10px]">⚠ Alerta</span>}
                      </div>
                    </div>
                    <button onClick={() => setConfirm(note.noteId)} className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                      Eliminar
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.noteContent}</p>
                  {note.alertTags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {note.alertTags.split(',').map((t, i) => (
                        <span key={i} className="badge-warning text-[11px]">{t.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nueva Nota de Fisioterapia" subtitle="Registra observaciones de rehabilitación" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="input-label">Paciente *</label>
            <select className="input-field" value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))} required>
              <option value="">Seleccionar paciente...</option>
              {patients.map(p => (
                <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Nota clínica *</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Observaciones de rehabilitación, evolución, ejercicios indicados..."
              value={form.noteContent}
              onChange={e => setForm(p => ({ ...p, noteContent: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="input-label">Etiquetas de alerta</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ALERT_TAG_OPTIONS.map(tag => {
                const active = form.alertTags.includes(tag);
                return (
                  <button
                    key={tag} type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${active ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAlert} onChange={e => setForm(p => ({ ...p, isAlert: e.target.checked }))} className="w-4 h-4 accent-red-600" />
            <span className="text-sm font-medium text-slate-700">Marcar como alerta urgente</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.patientId || !form.noteContent.trim()}>
              {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Guardar Nota
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm !== null} title="¿Eliminar nota?" message="Esta acción no se puede deshacer." onConfirm={handleDelete} onCancel={() => setConfirm(null)} danger />
    </div>
  );
}
