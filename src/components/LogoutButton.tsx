"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "topbar" | "inline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (variant === "topbar") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="topbar-logout-btn"
        aria-label="Keluar dari akun"
        title="Keluar"
      >
        <LogOut size={18} strokeWidth={1.8} />
        <span>{loading ? "Keluar..." : "Keluar"}</span>
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-logout-btn"
      >
        <LogOut size={15} strokeWidth={1.8} />
        <span>{loading ? "Keluar..." : "Keluar"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="side-logout-btn"
      aria-label="Keluar dari akun"
    >
      <LogOut size={16} strokeWidth={1.8} />
      <span>{loading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
