import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AlertTriangle, HeartPulse, LogIn } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";
import { BottomNav, SidebarNav, Topbar } from "./AppNav";
import { LogoutButton } from "./LogoutButton";

async function SidebarUserPanel() {
  const current = await getCurrentUserProfile();

  if (!current) {
    return (
      <div className="side-profile-wrap">
        <div className="side-profile">
          <div className="avatar small">TM</div>
          <div>
            <b>Pengunjung</b>
            <span>Belum masuk</span>
          </div>
          <Link href="/login" className="side-login-link">
            <LogIn size={16} strokeWidth={1.8} /> Masuk
          </Link>
        </div>
      </div>
    );
  }

  const modeLabel =
    current.mode === "post_aki"
      ? "Mode Pasca-AKI"
      : current.mode === "ckd"
        ? "Mode PGK / CKD"
        : current.email;

  return (
    <div className="side-profile-wrap">
      <div className="side-profile">
        <div className="avatar small">{current.initials}</div>
        <div>
          <b title={current.fullName}>{current.fullName}</b>
          <span>{modeLabel}</span>
        </div>
      </div>
      <LogoutButton variant="sidebar" />
    </div>
  );
}

async function TopbarMobileAuthAction() {
  const current = await getCurrentUserProfile();

  if (!current) {
    return (
      <Link href="/login" className="topbar-login-btn">
        <LogIn size={17} strokeWidth={1.8} />
        <span>Masuk</span>
      </Link>
    );
  }

  return <LogoutButton variant="topbar" />;
}

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

        <Suspense fallback={<nav aria-label="Navigasi utama" />}>
          <SidebarNav />
        </Suspense>

        <Link href="/tanda-bahaya" className="side-emergency">
          <AlertTriangle size={22} strokeWidth={1.8} />
          <span>
            <b>Tanda Bahaya</b>
            <small>Panduan keadaan darurat</small>
          </span>
        </Link>

        <Suspense
          fallback={
            <div className="side-profile-wrap">
              <div className="side-profile">
                <div className="avatar small">..</div>
                <div>
                  <b>Memuat profil...</b>
                  <span>RenalCare</span>
                </div>
              </div>
            </div>
          }
        >
          <SidebarUserPanel />
        </Suspense>
      </aside>

      <main className="shell-main">
        <Suspense fallback={<header className="topbar" />}>
          <Topbar
            rightSlot={
              <Suspense fallback={null}>
                <TopbarMobileAuthAction />
              </Suspense>
            }
          />
        </Suspense>
        <div className="content">{children}</div>
        <footer className="shell-footer">
          RenalCare adalah alat pemantau dan edukasi, bukan pengganti dokter.
        </footer>
      </main>

      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
