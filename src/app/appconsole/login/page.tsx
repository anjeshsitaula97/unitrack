import { getSessionEndNotice } from "@/lib/session-policy";
import { AppConsoleLoginForm } from "./AppConsoleLoginForm";

export const metadata = {
  title: "Super Admin Login | UniTrack",
  description: "Sign in to the UniTrack Super Admin console.",
};

export default async function AppConsoleLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  // Set by the console shell when it ended the Super Admin's session: for
  // inactivity, or because the account signed in somewhere else.
  return <AppConsoleLoginForm idleNotice={getSessionEndNotice(reason)} />;
}
