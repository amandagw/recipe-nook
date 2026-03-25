"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/");
    router.refresh();
  }

  return (
    <button className="secondary-button" onClick={handleLogout} type="button">
      Log out
    </button>
  );
}
