import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import OmShell from "../components/OmShell";

export const metadata: Metadata = {
  title: "Super Admin Console | UniTrack",
  description: "UniTrack platform console for Super Administrators",
};

export default async function OmConsoleLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || !isSuperAdminRole(session.role)) {
    redirect("/om/login");
  }

  return (
    <OmShell
      user={{
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </OmShell>
  );
}
