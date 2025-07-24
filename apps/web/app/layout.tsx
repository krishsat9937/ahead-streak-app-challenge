import ThemeProviderClient from "@/components/ThemeProviderClient";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en">
      <body>
        <ThemeProviderClient>
          {children}
        </ThemeProviderClient>
      </body>
    </html>
  );
}
