'use client';

import { useState, useEffect } from 'react';
import { Search, Users, AlertCircle, Eye, Droplets, Activity, User, Calendar, FileText } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';

interface PatientRow {
  userId: number; firstName: string; lastName: string; email: string;
  bloodType: string; allergies: string; weight: number; height: number;
  isAthlete: number; schoolLevel: string; dateOfBirth: string; gender: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[55%]">{value}</span>
    </div>
  );
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<PatientRow | null>(null);

  const getDoctorId = () => {
    const raw = document.cookie.split('; ').find(r => r.startsWith('session='))?.split('=')[1];
    try { return JSON.parse(decodeURIComponent(raw ?? '')).userId; } catch { return 2; }
  };

  useEffect(() => {
    fetch(`/api/doctor?doctorId=${getDoctorId()}`)
      .then(r => r.json())
      .then(d => { setPatients(d.patients ?? []); setLoading(false); });
  }, []);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const age = (dob: string) =>
    Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const bmi = (w: number, h: number) => (w / h ** 2).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Mis Pacientes</h1>
          <p className="page-subtitle">{patients.length} pacientes asignados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input-field pl-9" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.userId}
              className="section-card overflow-hidden hover:shadow-card-hover transition-shadow cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <div className={`h-1 ${p.allergies ? 'bg-amber-400' : 'bg-blue-500'}`} />
              <div className="p-4">
                {/* Avatar + name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {p.firstName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </div>
                  <span className="badge-info text-[10px]">{p.schoolLevel}</span>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Droplets className="w-3.5 h-3.5 text-red-500" />{p.bloodType}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />IMC: {bmi(p.weight, p.height)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5" />{age(p.dateOfBirth)} años
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />{p.gender === 'F' ? 'Femenino' : p.gender === 'M' ? 'Masculino' : 'Otro'}
                  </div>
                </div>

                {/* Allergies warning */}
                {p.allergies && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg mb-3">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-amber-700 font-medium truncate">Alergias: {p.allergies}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{p.isAthlete ? '🏃 Atleta' : '👤 Paciente'}</span>
                  <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                    <Eye className="w-3 h-3" /> Ver detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detalle del Paciente" size="lg">
        {selected && (
          <div className="space-y-4">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-5 text-white flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {selected.firstName[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{selected.firstName} {selected.lastName}</h3>
                <p className="text-blue-200 text-sm">{selected.email}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] px-2 py-0.5 bg-white/15 rounded-full">{selected.schoolLevel}</span>
                  {selected.isAthlete ? <span className="text-[11px] px-2 py-0.5 bg-emerald-400/30 rounded-full text-emerald-200">🏃 Atleta</span> : null}
                </div>
              </div>
              <div className="hidden sm:flex gap-4 bg-white/10 rounded-xl px-4 py-2.5">
                {[
                  { label: 'Edad',   value: `${age(selected.dateOfBirth)}a` },
                  { label: 'Sangre', value: selected.bloodType },
                  { label: 'IMC',    value: bmi(selected.weight, selected.height) },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-blue-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Personal */}
              <div className="section-card">
                <div className="section-card-header"><h4 className="section-card-title flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> Personal</h4></div>
                <div className="section-card-body">
                  <InfoRow label="Nombre"  value={`${selected.firstName} ${selected.lastName}`} />
                  <InfoRow label="Email"   value={selected.email} />
                  <InfoRow label="Nac."    value={new Date(selected.dateOfBirth).toLocaleDateString('es-MX')} />
                  <InfoRow label="Edad"    value={`${age(selected.dateOfBirth)} años`} />
                  <InfoRow label="Género"  value={selected.gender === 'F' ? 'Femenino' : selected.gender === 'M' ? 'Masculino' : 'Otro'} />
                  <InfoRow label="Escolar" value={selected.schoolLevel} />
                </div>
              </div>
              {/* Medical */}
              <div className="section-card">
                <div className="section-card-header"><h4 className="section-card-title flex items-center gap-2"><Activity className="w-4 h-4 text-red-500" /> Médico</h4></div>
                <div className="section-card-body">
                  <InfoRow label="Tipo Sangre" value={selected.bloodType} />
                  <InfoRow label="Peso"        value={`${selected.weight} kg`} />
                  <InfoRow label="Altura"      value={`${selected.height} m`} />
                  <InfoRow label="IMC"         value={bmi(selected.weight, selected.height)} />
                  <InfoRow label="Atleta"      value={selected.isAthlete ? 'Sí' : 'No'} />
                </div>
              </div>
            </div>

            {selected.allergies && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Alergias registradas</p>
                  <p className="text-sm text-amber-800 mt-0.5">{selected.allergies}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
