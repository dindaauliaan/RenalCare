"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  FlaskConical,
  HeartPulse,
  Home,
} from "lucide-react";

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

export function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">RenalCare</p>
        <h1>{title}</h1>
      </div>
      <Link href="/tanda-bahaya" className="emergency-btn">
        <AlertTriangle size={19} strokeWidth={1.8} /> <span>Tanda Bahaya / IGD</span>
      </Link>
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
