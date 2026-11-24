"use client";

import { useState } from "react";
import { ChevronDown, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { TrendChart } from "@/components/TrendChart";
import { POTASSIUM_CRITICAL_MMOL_L } from "@/lib/clinical";
import {
  DUMMY_LAB_HISTORY,
  DUMMY_LAB_TRENDS,
  type LabMetricTab,
  type LabPeriod,
} from "@/lib/dummy-data";

const TABS: LabMetricTab[] = ["eGFR", "Kreatinin", "ACR", "Kalium", "Ureum"];
const PERIODS: LabPeriod[] = ["3 Bln", "6 Bln", "1 Thn", "Semua"];

function LabFormModal({ onClose }: { onClose: () => void }) {
  const [potassium, setPotassium] = useState("");
  const parsedPotassium = Number(potassium);
  const critical =
    potassium.trim() !== "" &&
    Number.isFinite(parsedPotassium) &&
    parsedPotassium >= POTASSIUM_CRITICAL_MMOL_L;

  return (
    <div className="modal-backdrop">
      <div className="modal large-modal" role="dialog" aria-modal="true" aria-labelledby="lab-modal-title">
        <div className="modal-head">
          <div>
            <span className="label">INPUT CEPAT</span>
            <h2 id="lab-modal-title">Catat hasil lab</h2>
            <p>Salin angka persis seperti pada lembar hasil laboratorium.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {critical && (
          <Alert
            variant="critical"
            title="Nilai kalium sangat tinggi dan dapat berbahaya"
            description="Hubungi dokter atau layanan darurat segera."
          />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <label className="field full">
            Tanggal pengambilan sampel
            <input type="date" defaultValue="2026-09-24" />
          </label>
          <div className="form-grid">
            <label className="field">
              Kreatinin
              <div className="unit-input">
                <input type="number" step=".01" placeholder="contoh: 1,4" />
                <select aria-label="Satuan kreatinin">
                  <option>mg/dL</option>
                  <option>µmol/L</option>
                </select>
              </div>
            </label>
            <label className="field">
              Ureum
              <div className="unit-input">
                <input type="number" placeholder="contoh: 42" />
                <select aria-label="Satuan ureum">
                  <option>mg/dL (urea)</option>
                  <option>mg/dL (BUN)</option>
                  <option>mmol/L</option>
                </select>
              </div>
            </label>
            <label className="field">
              Kalium
              <div className="unit-input">
                <input
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  type="number"
                  step=".1"
                  placeholder="contoh: 4,5"
                />
                <span>mmol/L</span>
              </div>
            </label>
            <label className="field">
              ACR
              <div className="unit-input">
                <input type="number" placeholder="contoh: 35" />
                <select aria-label="Satuan ACR">
                  <option>mg/g</option>
                  <option>mg/mmol</option>
                </select>
              </div>
            </label>
          </div>

          <details>
            <summary>
              Masukkan rentang normal dari lembar lab Anda{" "}
              <ChevronDown size={18} strokeWidth={1.8} />
            </summary>
            <textarea placeholder="Tambahkan rentang normal atau catatan lain..." />
          </details>

          <label className="check-row">
            <input type="checkbox" />
            <span>
              <b>Hasil diambil saat saya sakit akut / dirawat</b>
              <small>Kondisi ini dapat membuat eGFR kurang stabil.</small>
            </span>
            <Info size={20} strokeWidth={1.8} />
          </label>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan hasil lab</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LabView() {
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<LabMetricTab>("eGFR");
  const [period, setPeriod] = useState<LabPeriod>("6 Bln");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const activeTrend = DUMMY_LAB_TRENDS[tab];
  const chartData = period === "3 Bln" ? activeTrend.data.slice(-3) : activeTrend.data;
  const rows =
    sortOrder === "newest" ? DUMMY_LAB_HISTORY : [...DUMMY_LAB_HISTORY].reverse();

  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Riwayat Lab"
          subtitle="Pantau perubahan hasil laboratorium Anda dari waktu ke waktu."
        />
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={19} strokeWidth={1.8} /> Catat hasil lab
        </Button>
      </div>

      <Card>
        <div className="tabs">
          {TABS.map((x) => (
            <button
              type="button"
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>

        <div className="chart-header">
          <div>
            <span className="label">TREN {tab.toUpperCase()}</span>
            <h3>{activeTrend.headline}</h3>
            <p>{activeTrend.subtitle}</p>
          </div>
          <div className="periods">
            {PERIODS.map((p) => (
              <button
                type="button"
                className={period === p ? "active" : ""}
                onClick={() => setPeriod(p)}
                key={p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <TrendChart
          data={chartData}
          metric={tab}
          unit={activeTrend.unit}
          domain={activeTrend.domain}
        />

        {tab === "eGFR" && (
          <div className="legend">
            <span>
              <i className="g1" /> G1 (≥90)
            </span>
            <span>
              <i className="g2" /> G2 (60–89)
            </span>
            <span>
              <i className="g3" /> G3 (30–59)
            </span>
            <span>
              <i className="g4" /> G4 (15–29)
            </span>
            <span>
              <i className="g5" /> G5 (&lt;15)
            </span>
          </div>
        )}
      </Card>

      <Card>
        <div className="card-heading">
          <div>
            <span className="label">SEMUA HASIL</span>
            <h3>Riwayat pemeriksaan</h3>
          </div>
          <select
            className="small-select"
            aria-label="Urutan riwayat pemeriksaan"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>

        <div className="lab-list">
          {rows.map((r) => (
            <div className="lab-row" key={r.id}>
              <div className="lab-date">
                <b>{r.date}</b>
                <span>{r.tag}</span>
              </div>
              <div>
                <small>eGFR</small>
                <b>{r.egfr}</b>
              </div>
              <div>
                <small>Kreatinin</small>
                <b>{r.creatinine}</b>
              </div>
              <div className="hide-mobile">
                <small>ACR</small>
                <b>{r.acr}</b>
              </div>
              <div className="hide-mobile">
                <small>Kalium</small>
                <b>{r.potassium}</b>
              </div>
              <div className="row-actions">
                <button type="button" aria-label="Edit">
                  <Pencil size={18} strokeWidth={1.8} />
                </button>
                <button type="button" aria-label="Hapus">
                  <Trash2 size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {formOpen && <LabFormModal onClose={() => setFormOpen(false)} />}
    </div>
  );
}
