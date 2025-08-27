import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Steuer Fair Gemeinsam',
  description: 'Faire Aufteilung von Steuererstattungen bei gemeinsamer Veranlagung',
  keywords: 'Steuer, Ehegatten, gemeinsame Veranlagung, Steuerersparnis, fair',
  authors: [{ name: 'Steuer Fair Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Steuer Fair Gemeinsam
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Faire Aufteilung von Steuererstattungen bei gemeinsamer Veranlagung
            </p>
          </header>
          <main>
            {children}
          </main>
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Steuer Fair Gemeinsam. Alle Rechte vorbehalten.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
