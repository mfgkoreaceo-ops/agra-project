import type { Metadata } from "next";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Agra | Premium & Modern Indian",
  description: "Experience the premium taste of India at Agra.",
};

import { SettingsProvider } from "./SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-premium">
      <head>
        <style>{`
          :root {
            --font-playfair: 'Playfair Display', serif;
            --font-inter: 'Inter', sans-serif;
          }
        `}</style>
      </head>
      <body>
        <SettingsProvider>
          <ClientLayout>{children}</ClientLayout>
        </SettingsProvider>
      </body>
    </html>
  );
}
