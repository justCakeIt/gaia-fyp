import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "G.a.i.A. (MVP)",
  description: "Green AI Alchemy - MVP frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}