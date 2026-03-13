import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'MedSystem — Hospital Management',
  description: 'Sistema de gestión hospitalaria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
