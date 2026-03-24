'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock3, RefreshCw } from 'lucide-react';

interface Apt {
  appointmentId: number; patientName: string;
  dateTime: string; status: string;
}

const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

type DStatus = 'Aceptada' | 'Pendiente' | 'Completada' | 'Denegada';
const STATUS_CFG: Record<DStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Aceptada:   { label: 'Aceptada',   color: '#059669', bg: '#d1fae5', border: '#6ee7b7', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Denegada:   { label: 'Denegada',   color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: <XCircle    className="w-3.5 h-3.5" /> },
  Pendiente:  { label: 'Pendiente',  color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: <Clock3     className="w-3.5 h-3.5" /> },
  Completada: { label: 'Completada', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

function toDisplay(s: string): DStatus {
  if (s === 'Aceptada')   return 'Aceptada';
  if (s === 'Completada') return 'Completada';
  if (s === 'Cancelada' || s === 'Denegada') return 'Denegada';
  return 'Pendiente';
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function DoctorSchedule() {
  const [apts,     setApts]     = useState<Apt[]>([]);
  const [loading,  setLoading]  = useState(true);
  const today = new Date();
  const [viewYear,  setYear]  = useState(today.getFullYear());
  const [viewMonth, setMonth] = useState(today.getMonth());
  const [selDate,   setSelDate] = useState(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  const [aptFilter, setAptFilter] = useState<'all' | DStatus>('all');

  const getDoctorId = () => {
    try { return JSON.parse(localStorage.getItem('session') ?? '{}').userId ?? 2; }
    catch { return 2; }
  };

  const reload = () => {
    fetch(`/api/doctor?doctorId=${getDoctorId()}`)
      .then(r => r.json())
      .then(d => { setApts(d.appointments ?? []); setLoading(false); });
  };

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') reload(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []); // eslint-disable-line

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/doctor', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId: id, status }) });
    reload();
  };

  // Calendar helpers
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const aptsInMonth = useMemo(() =>
    apts.filter(a => {
      const d = new Date(a.dateTime);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    }), [apts, viewYear, viewMonth]);

  const dotsByDay = useMemo(() => {
    const m: Record<string, DStatus[]> = {};
    aptsInMonth.forEach(a => {
      const key = String(new Date(a.dateTime).getDate());
      if (!m[key]) m[key] = [];
      m[key].push(toDisplay(String(a.status)));
    });
    return m;
  }, [aptsInMonth]);

  const panelApts = useMemo(() => {
    const base = apts.filter(a => String(a.dateTime).startsWith(selDate));
    if (aptFilter === 'all') return base;
    return base.filter(a => toDisplay(String(a.status)) === aptFilter);
  }, [apts, selDate, aptFilter]);

  const prevMonth = () => { if (viewMonth === 0) { setYear(y => y - 1); setMonth(11); } else { setMonth(m => m - 1); } };
  const nextMonth = () => { if (viewMonth === 11) { setYear(y => y + 1); setMonth(0); } else { setMonth(m => m + 1); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Mi Agenda</h1>
          <p className="page-subtitle">Gestiona y actualiza el estado de tus citas</p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Calendar */}
        <div className="lg:col-span-2 section-card overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            <span className="font-semibold text-slate-800 text-sm">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5 p-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day    = i + 1;
              const dStr   = toDateStr(viewYear, viewMonth, day);
              const isToday= dStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
              const isSel  = dStr === selDate;
              const dots   = dotsByDay[String(day)] ?? [];

              return (
                <button
                  key={day}
                  onClick={() => setSelDate(dStr)}
                  className={[
                    'relative flex flex-col items-center justify-center rounded-lg py-1.5 text-sm transition-colors',
                    isSel  ? 'bg-blue-600 text-white'  :
                    isToday? 'bg-blue-50 text-blue-700 font-bold' :
                             'hover:bg-slate-50 text-slate-700',
                  ].join(' ')}
                >
                  <span className="font-medium">{day}</span>
                  {dots.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dots.slice(0, 3).map((s, k) => (
                        <div key={k} className="w-1 h-1 rounded-full" style={{ background: isSel ? '#fff' : STATUS_CFG[s].color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3 section-card overflow-hidden">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">
                {new Date(selDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{panelApts.length} citas</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-slate-100">
            {(['all', 'Pendiente', 'Aceptada', 'Completada', 'Denegada'] as const).map(f => (
              <button
                key={f}
                onClick={() => setAptFilter(f)}
                className={[
                  'text-xs px-3 py-1 rounded-full font-medium transition-colors border',
                  aptFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>

          {/* Appointment cards */}
          <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 400 }}>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : panelApts.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">Sin citas para este día</p>
            ) : panelApts.map(apt => {
              const ds  = toDisplay(String(apt.status));
              const cfg = STATUS_CFG[ds];
              const d   = new Date(apt.dateTime);

              return (
                <div key={apt.appointmentId} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {String(apt.patientName)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-slate-800 text-sm truncate">{String(apt.patientName)}</p>
                        <span style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        🕐 {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Action buttons */}
                      <div className="flex gap-1.5 flex-wrap">
                        {(['Aceptada', 'Pendiente', 'Completada', 'Denegada'] as DStatus[]).map(s => {
                          const c = STATUS_CFG[s];
                          const isActive = ds === s;
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(apt.appointmentId, s)}
                              style={isActive ? { background: c.bg, color: c.color, borderColor: c.border } : {}}
                              className={[
                                'text-[11px] px-2.5 py-1 rounded-lg border transition-colors',
                                isActive ? 'font-semibold' : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                              ].join(' ')}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}