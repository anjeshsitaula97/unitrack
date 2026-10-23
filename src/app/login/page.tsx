import { getSessionEndNotice } from "@/lib/session-policy";
import LoginForm from "./components/LoginForm";

export const metadata = {
  title: "Login | UniTrack",
  description: "UniTrack administration - Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  // The app shell appends ?reason=idle (or ?reason=elsewhere when the account
  // signed in somewhere else) when it signs somebody out automatically, so the
  // form can explain what happened instead of showing a blank page. Read here
  // rather than in the client component: the reason is known before hydration
  // and needs no extra render pass.
  return <LoginForm idleNotice={getSessionEndNotice(reason)} />;
}
