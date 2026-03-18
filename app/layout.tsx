import './globals.css';
import React from 'react';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" dir="ltr">
      <body>
        {children}
      </body>
    </html>
  );
}