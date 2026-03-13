'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Heart, User, Stethoscope, Shield } from 'lucide-react';

const QUICK_ACCESS = [
  {
    label:       'Paciente',
    email:       'patient@demo.com',
    password:    'patient123',
    icon:        User,
    avatarBg:    'bg-emerald-500',
    textColor:   'text-emerald-700',
    cardBg:      'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
    description: 'Ver citas, consultas y reportes',
  },
  {
    label:       'Doctor',
    email:       'doctor@demo.com',
    password:    'doctor123',
    icon:        Stethoscope,
    avatarBg:    'bg-blue-500',
    textColor:   'text-blue-700',
    cardBg:      'bg-blue-50 hover:bg-blue-100 border-blue-200',
    description: 'Gestionar pacientes y agenda',
  },
  {
    label:       'Administrador',
    email:       'admin@demo.com',
    password:    'admin123',
    icon:        Shield,
    avatarBg:    'bg-purple-500',
    textColor:   'text-purple-700',
    cardBg:      'bg-purple-50 hover:bg-purple-100 border-purple-200',
    description: 'Control total del sistema',
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const doLogin = async (e: string, p: string) => {
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: e, password: p }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Credenciales incorrectas');
        return;
      }

      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        Estudiante:    '/patient/dashboard',
        Doctor:        '/patient/dashboard', // change to /doctor/dashboard later
        Administrador: '/patient/dashboard', // change to /admin/dashboard later
      };
      router.replace(roleRoutes[data.roleName] ?? '/patient/dashboard');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleQuickLogin = (acc: (typeof QUICK_ACCESS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    doLogin(acc.email, acc.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MedSystem</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Gestión Hospitalaria</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">Iniciar Sesión</h2>
            <p className="text-slate-500 text-sm mb-6">Ingresa tus credenciales para continuar</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Correo electrónico</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </>
                ) : 'Iniciar Sesión'}
              </button>
            </form>
          </div>

          {/* Quick access */}
          <div className="px-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">Acceso Rápido Demo</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {QUICK_ACCESS.map(acc => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.label}
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${acc.cardBg} disabled:opacity-50`}
                  >
                    <div className={`w-9 h-9 ${acc.avatarBg} rounded-lg flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-xs font-semibold ${acc.textColor}`}>{acc.label}</span>
                    <span className="text-[10px] text-slate-500 text-center leading-tight hidden sm:block">
                      {acc.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} MedSystem · Hospital Management
        </p>
      </div>
    </div>
  );
}
