import { AuthProvider } from '@/context/AuthContext';
import { IconSprite } from '@/components/Icon';
import './globals.css';

export const metadata = {
  title: 'MediQueue — See a doctor, without the wait',
  description: 'Real-time clinic appointment booking and live queue management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IconSprite />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
