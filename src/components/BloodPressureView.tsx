"use client";

import { useState } from "react";
import { ChevronRight, Info, TrendingUp } from "lucide-react";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { BP_CRITICAL_DIASTOLIC_MMHG, BP_CRITICAL_SYSTOLIC_MMHG } from "@/lib/clinical";
import { DUMMY_BP_SUMMARY } from "@/lib/dummy-data";

export function BloodPressureView() {
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const parsedSys = Number(sys);
  const parsedDia = Number(dia);
  const critical =
    (sys.trim() !== "" && Number.isFinite(parsedSys) && parsedSys >= BP_CRITICAL_SYSTOLIC_MMHG) ||
    (dia.trim() !== "" && Number.isFinite(parsedDia) && parsedDia >= BP_CRITICAL_DIASTOLIC_MMHG);

  return (
    <div className="page">
      <PageTitle
        title="Tekanan Darah"
        subtitle="Catat secara rutin agar dokter dapat melihat pola tekanan darah Anda."
      />

      <button type="button" className="guide-banner">
        <span>
          <Info size={22} strokeWidth={1.8} />
        </span>
        <div>
          <b>Panduan cara ukur tekanan darah yang benar</b>
          <small>Duduk tenang, kaki menapak, lengan setinggi jantung.</small>
        </div>
        <ChevronRight size={22} strokeWidth={1.8} />
      </button>

      {critical && (
        <Alert
          variant="critical"
          title="Tekanan darah Anda sangat tinggi"
          description="Duduk tenang dan ukur ulang setelah 5 menit. Jika tetap tinggi atau ada nyeri dada/sesak, segera ke IGD."
        />
      )}

      <div className="blood-grid">
        <Card className="bp-form">
          <span className="label">CATAT SEKARANG</span>
          <h3>Hasil pengukuran</h3>
          <div className="bp-inputs">
            <label>
              Sistolik
              <input
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                type="number"
                placeholder="120"
              />
              <small>mmHg</small>
            </label>
            <span>/</span>
            <label>
              Diastolik
              <input
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                type="number"
                placeholder="80"
              />
              <small>mmHg</small>
            </label>
          </div>
          <div className="form-grid compact">
            <label className="field">
              Denyut nadi (opsional)
              <input type="number" placeholder="72 kali/menit" />
            </label>
            <label className="field">
              Lengan
              <select>
                <option>Kiri</option>
                <option>Kanan</option>
              </select>
            </label>
            <label className="field">
              Posisi
              <select>
                <option>Duduk</option>
                <option>Berdiri</option>
                <option>Berbaring</option>
              </select>
            </label>
            <label className="field">
              Tanggal &amp; jam
              <input type="datetime-local" defaultValue="2026-09-24T07:15" />
            </label>
          </div>
          <Button className="full-btn">Simpan pengukuran</Button>
        </Card>

        <div className="side-stack">
          <Card>
            <div className="card-heading">
              <div>
                <span className="label">RATA-RATA 7 HARI</span>
                <h3>Tekanan darah</h3>
              </div>
              <span className="soft-badge">{DUMMY_BP_SUMMARY.avg7Days.status}</span>
            </div>
            <div className="average">
              <b>{DUMMY_BP_SUMMARY.avg7Days.systolic}</b>
              <span>/</span>
              <b>{DUMMY_BP_SUMMARY.avg7Days.diastolic}</b>
              <small>mmHg</small>
            </div>
            <div className="mini-bars" aria-hidden="true">
              {DUMMY_BP_SUMMARY.miniBarsHeights.map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
            <p className="muted">
              Rata-rata 30 hari: <b>{DUMMY_BP_SUMMARY.avg30Days}</b>
            </p>
          </Card>

          <Card className="target-empty">
            <div className="empty-icon">
              <TrendingUp size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h3>Target dari dokter</h3>
              <p>Belum ada target tekanan darah. Tanyakan ke dokter, lalu isi di sini.</p>
            </div>
            <Button variant="outline">Atur Target</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
