import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/components/ui/Sidebar';
import Topbar  from '@/app/components/ui/Topbar';

interface Session {
  userId:   number;
  roleName: string;
  firstName: string;
  lastName:  string;
  email:     string;
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  // Read session cookie set at login
  const cookieStore = cookies();
  const raw         = cookieStore.get('session')?.value;

  if (!raw) redirect('/');

  let session: Session;
  try {
    session = JSON.parse(raw) as Session;
  } catch {
    redirect('/');
  }

  const userName = `${session.firstName} ${session.lastName}`;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar userName={userName} roleName={session.roleName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          pageTitle="MedSystem"
          userName={userName}
          userEmail={session.email}
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
