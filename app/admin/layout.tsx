// app/admin/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';
import Topbar from '@/app/components/ui/Topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get('session')?.value;
  if (!raw) redirect('/');

  try {
    const session = JSON.parse(raw);
    if (session.roleName !== 'Administrador') redirect('/patient/dashboard');
  } catch {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}