"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  FlaskConical,
  HeartPulse,
  Home,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", mobileLabel: "Beranda", icon: Home },
  { href: "/lab", label: "Riwayat Lab", mobileLabel: "Lab", icon: FlaskConical },
  { href: "/tekanan-darah", label: "Tekanan Darah", mobileLabel: "Tensi", icon: HeartPulse },
  { href: "/agenda", label: "Agenda", mobileLabel: "Agenda", icon: Calendar },
  { href: "/edukasi", label: "Edukasi", mobileLabel: "Edukasi", icon: BookOpen },
] as const;

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/tanda-bahaya")) return "Tanda Bahaya";
  if (pathname.startsWith("/profil")) return "Profil & Hak Data";
  const matched = NAV_ITEMS.find((item) => isRouteActive(pathname, item.href));
  return matched?.label ?? "Tanda Bahaya";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isRouteActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <Icon size={22} strokeWidth={1.8} />
            <span>{item.label}</span>
            {active && <i aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function Topbar({ rightSlot }: { rightSlot?: ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">RenalCare</p>
        <h1>{title}</h1>
      </div>
      {rightSlot ? <div className="topbar-actions">{rightSlot}</div> : null}
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navigasi bawah">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isRouteActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <Icon size={21} strokeWidth={1.8} />
            <span>{item.mobileLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
