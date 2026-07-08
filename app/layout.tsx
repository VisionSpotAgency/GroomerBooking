import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GroomerBooking — prototyp",
  description: "Prototyp aplikacji SaaS do rezerwacji wizyt w salonach groomerskich."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
