import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import Topbar from '@/app/components/ui/Topbar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookies();
  if (!session) redirect('/');
  if (session.roleName !== 'Administrador') {
    if (['Doctor', 'Jefe Médico', 'Nutriólogo'].includes(session.roleName)) redirect('/doctor/dashboard');
    redirect('/patient/dashboard');
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar pageTitle="MedSystem — Administración" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
