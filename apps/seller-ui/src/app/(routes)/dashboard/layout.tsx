import { ThemeProvider } from "@/app/ThemeProvider";
import React from "react";
import { AppSidebar } from "../../../components/app-sidebar";

import { SidebarInset, SidebarProvider } from "../../../components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <SidebarProvider>
            <AppSidebar />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarInset>{children}</SidebarInset>
            </ThemeProvider>
          </SidebarProvider>
        </body>
      </html>
    </>
  );
};

export default Layout;
