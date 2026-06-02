import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GoogleAdSense from "@/components/GoogleAdSense";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MiMotor",
  description: "Compra y venta de vehículos en Chile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <GoogleAdSense />
        <Navbar />
        {children}
          <Footer />
      </body>
    </html>
  );
}