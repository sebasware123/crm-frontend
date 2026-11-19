import type { Metadata } from "next";
import "./globals.css";
import "./enhancements.css";
import "./assistant.css";

export const metadata: Metadata = {
  title: { default: "Nexo CRM", template: "%s · Nexo CRM" },
  description: "CRM SaaS para gestionar contactos, empresas y oportunidades de venta."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
