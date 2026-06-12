import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Agency Command Center - Revenue Black",
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
      className={`${figtree.variable} h-full antialiased dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased overflow-hidden selection:bg-primary/30 selection:text-on-primary">
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full md:ml-[280px] bg-background relative overflow-y-auto scroll-smooth pb-20 md:pb-0">
            {children}
          </div>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
