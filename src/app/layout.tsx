import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Erika Dashboard - Control Ejecutivo de Agencia de Marketing",
};

import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface font-body-md antialiased overflow-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full md:ml-[280px] bg-surface relative overflow-y-auto scroll-smooth pb-20 md:pb-0">
            {children}
          </div>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
