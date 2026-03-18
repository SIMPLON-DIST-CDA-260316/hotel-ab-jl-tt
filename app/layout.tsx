import "./globals.css";
import React from "react";
import { Header } from "@/components/layout/Header";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}