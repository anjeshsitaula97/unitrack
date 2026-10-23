import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import AppConsoleShell from "../components/AppConsoleShell";

export const metadata: Metadata = {
  title: "Super Admin Console | UniTrack",
  description: "UniTrack platform console for Super Administrators",
};

export default async function AppConsoleLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || !isSuperAdminRole(session.role)) {
    redirect("/appconsole/login");
  }

  return (
    <AppConsoleShell
      user={{
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AppConsoleShell>
  );
}
