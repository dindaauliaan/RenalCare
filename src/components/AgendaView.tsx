"use client";

import { useState } from "react";
import { Calendar, Check, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";

type AgendaFilter = "Akan Datang" | "Selesai" | "Terlewat";

const FILTERS: Array<{ label: AgendaFilter; count: number }> = [
  { label: "Akan Datang", count: 3 },
  { label: "Selesai", count: 2 },
  { label: "Terlewat", count: 1 },
];

export function AgendaView() {
  const [filter, setFilter] = useState<AgendaFilter>("Akan Datang");

  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Agenda & Pengingat"
          subtitle="Jadwal kontrol dan pemeriksaan Anda untuk 30 hari ke depan."
        />
        <Button>
          <Plus size={19} strokeWidth={1.8} /> Tambah pengingat
        </Button>
      </div>

      <Card className="recommendation">
        <div className="recommend-icon">
          <Calendar size={22} strokeWidth={1.8} />
        </div>
        <div>
          <span className="label">SARAN INTERVAL LAB</span>
          <h3>Jaga pemeriksaan Anda tetap rutin</h3>
          <p>
            Untuk stage <b>G3a A2</b>, disarankan cek lab sekitar 2–3x setahun. Sesuaikan dengan
            anjuran dokter Anda.
          </p>
        </div>
        <Button variant="outline">Buat Pengingat</Button>
      </Card>

      <div className="filter-tabs">
        {FILTERS.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => setFilter(item.label)}
            className={filter === item.label ? "active" : ""}
          >
            {item.label}
            <span>{item.count}</span>
          </button>
        ))}
      </div>

      <div className="schedule">
        {filter === "Akan Datang" ? (
          <>
            <Card className="schedule-card">
              <div className="date-block">
                <b>28</b>
                <span>SEP</span>
              </div>
              <div className="schedule-info">
                <span className="status upcoming">4 hari lagi</span>
                <h3>Kontrol dokter ginjal</h3>
                <p>09.30 WIB · RS Harapan Sehat</p>
                <small>Bawa hasil lab terakhir dan daftar obat.</small>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
            <Card className="schedule-card">
              <div className="date-block blue">
                <b>12</b>
                <span>OKT</span>
              </div>
              <div className="schedule-info">
                <span className="status planned">Pemeriksaan</span>
                <h3>Cek laboratorium rutin</h3>
                <p>07.00 WIB · Lab Medika Utama</p>
                <small>Kreatinin, ureum, kalium, dan ACR.</small>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
            <Card className="schedule-card">
              <div className="date-block">
                <b>21</b>
                <span>OKT</span>
              </div>
              <div className="schedule-info">
                <span className="status upcoming">Pengingat</span>
                <h3>Ambil resep obat bulanan</h3>
                <p>10.00 WIB · Klinik Penyakit Dalam</p>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
          </>
        ) : filter === "Selesai" ? (
          <Card className="schedule-card">
            <div className="date-block done">
              <Check size={22} strokeWidth={1.8} />
            </div>
            <div className="schedule-info">
              <span className="status completed">Selesai</span>
              <h3>Cek laboratorium rutin</h3>
              <p>18 Sep 2026 · Lab Medika Utama</p>
            </div>
            <Button href="/lab">Catat Hasil Lab Sekarang</Button>
          </Card>
        ) : (
          <Card className="empty-state">
            <Calendar size={22} strokeWidth={1.8} />
            <h3>Tidak ada agenda terlewat</h3>
            <p>Bagus, semua agenda Anda tertangani.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
