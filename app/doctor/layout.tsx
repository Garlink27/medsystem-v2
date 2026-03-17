import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/components/ui/Sidebar';
import Topbar  from '@/app/components/ui/Topbar';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get('session')?.value;
  if (!raw) redirect('/');
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}