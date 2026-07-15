"use client";

import { type ReactNode } from "react";
import { TanStackProvider } from "@/providers/tanstack-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SocketProvider } from "@/providers/socket-provider";

export function Providers({
  children,
  token,
}: {
  children: ReactNode;
  token?: string;
}) {
  return (
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
      >
      <TanStackProvider>
        <SocketProvider token={token}>{children}</SocketProvider>
      </TanStackProvider>
    </ThemeProvider>
  );
}
