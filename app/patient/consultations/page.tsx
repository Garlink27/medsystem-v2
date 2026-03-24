'use client';

import { useState, useEffect } from 'react';
import {
  Stethoscope, Pill, Calendar, ChevronDown, ChevronUp,
  FileText, ClipboardList, Download,
} from 'lucide-react';

interface Prescription {
  prescriptionId:  number;
  consultationId:  number;
  brandName:       string;
  activeIngredient:string;
  dosage:          string;
  frequency:       string;
  duration:        string;
}

interface ClinicalFile {
  fileId:        number;
  consultationId:number;
  fileType:      string;
  fileUrl:       string;
}

interface Consultation {
  consultationId:   number;
  appointmentId:    number;
  diagnosis:        string;
  symptoms:         string;
  consultationDate: string;
  doctorName:       string;
  prescriptions:    Prescription[];
  files:            ClinicalFile[];
}

function getPatientId(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return 1;
    return JSON.parse(raw).userId ?? 1;
  } catch { return 1; }
}

// ── Sub-components defined OUTSIDE to prevent remount ─────────────────

function SymptomChip({ text }: { text: string }) {
  return <span className="badge-gray">{text}</span>;
}

function PrescriptionRow({ rx }: { rx: Prescription }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {rx.brandName}
          {rx.activeIngredient && (
            <span className="text-slate-400 font-normal text-xs ml-1">({rx.activeIngredient})</span>
          )}
          {rx.dosage && <span className="text-slate-600 font-normal"> — {rx.dosage}</span>}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {[rx.frequency, rx.duration].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}

function FileRow({ file }: { file: ClinicalFile }) {
  const icons: Record<string, string> = {
    'Rayos X': '🫁', 'Resultados de Laboratorio': '🔬',
    'PDF Receta': '💊', 'PDF Plan Nutricional': '🥗', 'PDF Reporte Integral': '📋',
  };
  const badges: Record<string, string> = {
    'Rayos X': 'badge-info', 'Resultados de Laboratorio': 'badge-warning',
    'PDF Receta': 'badge-success', 'PDF Plan Nutricional': 'badge-purple', 'PDF Reporte Integral': 'badge-gray',
  };

  return (
    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
      <span className="text-lg">{icons[file.fileType] ?? '📄'}</span>
      <span className={`${badges[file.fileType] ?? 'badge-gray'} text-xs`}>{file.fileType}</span>
      <div className="flex-1" />
      {file.fileUrl && !file.fileUrl.startsWith('data:text') && (
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Download className="w-3 h-3" /> Ver
        </a>
      )}
    </div>
  );
}

function ConsultationCard({
  con,
  isOpen,
  onToggle,
}: {
  con: Consultation;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const symptoms = con.symptoms
    ? con.symptoms.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="section-card overflow-hidden">
      <div className="h-0.5 bg-blue-500" />

      {/* ── Header (always visible, clickable) ── */}
      <button
        className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{con.diagnosis}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{con.doctorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                {con.consultationDate}
              </div>
              {symptoms.length > 0 && !isOpen && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {symptoms.slice(0, 2).join(', ')}{symptoms.length > 2 ? '…' : ''}
                </p>
              )}
            </div>
            {isOpen
              ? <ChevronUp  className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">

          {/* Symptoms */}
          {symptoms.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Síntomas
              </p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s, i) => <SymptomChip key={i} text={s} />)}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {con.prescriptions.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Receta Médica
              </p>
              <div className="space-y-2">
                {con.prescriptions.map(rx => (
                  <PrescriptionRow key={rx.prescriptionId} rx={rx} />
                ))}
              </div>
            </div>
          )}

          {/* Clinical files */}
          {con.files.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Archivos Clínicos
              </p>
              <div className="space-y-2">
                {con.files.map(f => <FileRow key={f.fileId} file={f} />)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {symptoms.length === 0 && con.prescriptions.length === 0 && con.files.length === 0 && (
            <p className="text-sm text-slate-400 italic">Sin información adicional registrada.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function PatientConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedId,    setExpandedId]    = useState<number | null>(null);

  useEffect(() => {
    const patientId = getPatientId();
    fetch(`/api/consultations?patientId=${patientId}`)
      .then(r => r.json())
      .then(data => {
        const list: Consultation[] = data.consultations ?? [];
        setConsultations(list);
        // Auto-expand the most recent one
        if (list.length > 0) setExpandedId(list[0].consultationId);
        setLoading(false);
      });
  }, []);

  const toggle = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Historial de Consultas</h1>
        <p className="page-subtitle">{consultations.length} consultas registradas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No tienes consultas registradas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(con => (
            <ConsultationCard
              key={con.consultationId}
              con={con}
              isOpen={expandedId === con.consultationId}
              onToggle={() => toggle(con.consultationId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}