import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Notes App",
  description: "Simple notes app with basic auth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          {children}
        </div>
      </body>
    </html>
  );
}
