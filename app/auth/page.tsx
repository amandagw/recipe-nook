import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function AuthPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <AuthForm />;
}
