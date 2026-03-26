import "./globals.css";
import React from "react";
import { Comfortaa } from "next/font/google";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
});
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getActivePendingBooking } from "@/features/bookings/queries/get-active-pending-booking";
import { PendingBookingBanner } from "@/features/bookings/components/PendingBookingBanner";

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  const pendingBooking = session
    ? await getActivePendingBooking(session.user.id)
    : null;

  return (
    <html lang="fr" dir="ltr" className={comfortaa.variable}>
      <body className="font-sans">
        <Header />
        {pendingBooking && pendingBooking.expiresAt && (
          <PendingBookingBanner
            bookingId={pendingBooking.id}
            suiteTitle={pendingBooking.suite.title}
            expiresAt={pendingBooking.expiresAt.toISOString()}
          />
        )}
        {children}
        <Footer />
      </body>
    </html>
  );
}