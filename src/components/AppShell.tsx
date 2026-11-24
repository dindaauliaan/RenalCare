import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ChevronRight, HeartPulse } from "lucide-react";
import { DUMMY_PROFILE } from "@/lib/dummy-data";
import { BottomNav, SidebarNav, Topbar } from "./AppNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <div className="brand-mark">
            <HeartPulse size={22} strokeWidth={1.8} />
          </div>
          <div>
            <b>RenalCare</b>
            <span>Kidney Health Monitor</span>
          </div>
        </Link>

        <SidebarNav />

        <Link href="/tanda-bahaya" className="side-emergency">
          <AlertTriangle size={22} strokeWidth={1.8} />
          <span>
            <b>Tanda Bahaya</b>
            <small>Panduan keadaan darurat</small>
          </span>
        </Link>

        <div className="side-profile">
          <div className="avatar small">{DUMMY_PROFILE.initials}</div>
          <div>
            <b>{DUMMY_PROFILE.fullName}</b>
            <span>Lihat profil</span>
          </div>
          <ChevronRight size={17} strokeWidth={1.8} />
        </div>
      </aside>

      <main className="shell-main">
        <Topbar />
        <div className="content">{children}</div>
        <footer className="shell-footer">
          RenalCare adalah alat pemantau dan edukasi, bukan pengganti dokter.
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
