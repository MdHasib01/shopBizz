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

            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </body>
      </html>
    </>
  );
};

export default Layout;
