import type { Metadata } from "next";
import "./globals.css";
import { GaiaSessionProvider } from "@/components/session-provider";
import GaiaTopBar from "@/components/GaiaTopBar";

export const metadata: Metadata = {
  title: "G.A.I.A. — Green AI Alchemy",
  description:
    "Calm, supportive wellness guidance for people living with diagnosed conditions. Nature-led, botanically inspired, never diagnostic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GaiaSessionProvider>
          <GaiaTopBar />
          {children}
        </GaiaSessionProvider>
      </body>
    </html>
  );
}
