"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ChevronDown,
  FlaskConical,
  Info,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createLabResultAction,
  deleteLabResultAction,
  updateLabResultAction,
} from "@/app/(app)/lab/actions";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { TrendChart } from "@/components/TrendChart";
import {
  ACR_UNITS,
  CREATININE_UNITS,
  POTASSIUM_CRITICAL_MMOL_L,
  UREA_UNITS,
  type AcrUnit,
  type CreatinineUnit,
  type UreaUnit,
} from "@/lib/clinical";
import {
  buildLabTrendSeries,
  getLabRowDisplay,
  sortLabRows,
  type LabMetricTab,
  type LabPeriod,
  type LabRowDisplay,
  type LabSortOrder,
} from "@/lib/labs/processing";
import {
  labFormSchema,
  parseNumericInputString,
  type LabFormValues,
} from "@/lib/labs/schemas";
import type { LabResult } from "@/types/database";

const TABS: LabMetricTab[] = ["eGFR", "Kreatinin", "ACR", "Kalium", "Ureum"];
const PERIODS: LabPeriod[] = ["3 Bln", "6 Bln", "1 Thn", "Semua"];

function getTodayIsoLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function buildDefaultFormValues(editingLab: LabResult | null): LabFormValues {
  if (!editingLab) {
    return {
      measuredAt: getTodayIsoLocal(),
      creatinine: "",
      creatinineUnit: "mg/dL",
      urea: "",
      ureaUnit: "mg/dL (urea)",
      potassium: "",
      acr: "",
      acrUnit: "mg/g",
      referenceNotes: "",
      isAcuteIllness: false,
    };
  }

  return {
    measuredAt: editingLab.measured_at,
    creatinine: editingLab.creatinine === null ? "" : String(editingLab.creatinine),
    creatinineUnit: CREATININE_UNITS.includes(editingLab.creatinine_unit as CreatinineUnit)
      ? (editingLab.creatinine_unit as CreatinineUnit)
      : "mg/dL",
    urea: editingLab.urea === null ? "" : String(editingLab.urea),
    ureaUnit: UREA_UNITS.includes(editingLab.urea_unit as UreaUnit)
      ? (editingLab.urea_unit as UreaUnit)
      : "mg/dL (urea)",
    potassium: editingLab.potassium === null ? "" : String(editingLab.potassium),
    acr: editingLab.acr === null ? "" : String(editingLab.acr),
    acrUnit: ACR_UNITS.includes(editingLab.acr_unit as AcrUnit)
      ? (editingLab.acr_unit as AcrUnit)
      : "mg/g",
    referenceNotes: editingLab.reference_notes ?? "",
    isAcuteIllness: Boolean(editingLab.is_acute_illness),
  };
}

function LabFormModal({
  editingLab,
  onClose,
  onSaved,
}: {
  editingLab: LabResult | null;
  onClose: () => void;
  onSaved: (saved: LabResult, mode: "create" | "edit") => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LabFormValues>({
    resolver: zodResolver(labFormSchema),
    defaultValues: buildDefaultFormValues(editingLab),
  });

  const potassiumValue = useWatch({ control, name: "potassium" });
  const parsedPotassium = parseNumericInputString(potassiumValue ?? "");
  const isPotassiumHigh =
    parsedPotassium !== null &&
    !Number.isNaN(parsedPotassium) &&
    parsedPotassium >= POTASSIUM_CRITICAL_MMOL_L;

  const onSubmit = async (values: LabFormValues) => {
    setServerError(null);
    const result = editingLab
      ? await updateLabResultAction(editingLab.id, values)
      : await createLabResultAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    onSaved(result.data, editingLab ? "edit" : "create");
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal large-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-modal-title"
      >
        <div className="modal-head">
          <div>
            <span className="label">{editingLab ? "PERBARUI DATA" : "INPUT CEPAT"}</span>
            <h2 id="lab-modal-title">
              {editingLab ? "Edit hasil lab" : "Catat hasil lab"}
            </h2>
            <p>Salin angka persis seperti pada lembar hasil laboratorium.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {isPotassiumHigh && (
          <Alert
            variant="critical"
            title="Nilai kalium sangat tinggi dan dapat berbahaya"
            description="Hubungi dokter atau layanan darurat segera."
          />
        )}

        {serverError && (
          <Alert variant="critical" title="Gagal menyimpan hasil lab" description={serverError} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field full">
            Tanggal pengambilan sampel
            <input type="date" max={getTodayIsoLocal()} {...register("measuredAt")} />
            {errors.measuredAt && (
              <small className="field-error">{errors.measuredAt.message}</small>
            )}
          </label>

          <div className="form-grid">
            <label className="field">
              Kreatinin
              <div className="unit-input">
                <input
                  type="number"
                  step="any"
                  placeholder="contoh: 1.4"
                  {...register("creatinine")}
                />
                <select aria-label="Satuan kreatinin" {...register("creatinineUnit")}>
                  {CREATININE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {errors.creatinine && (
                <small className="field-error">{errors.creatinine.message}</small>
              )}
            </label>

            <label className="field">
              Ureum
              <div className="unit-input">
                <input type="number" step="any" placeholder="contoh: 42" {...register("urea")} />
                <select aria-label="Satuan ureum" {...register("ureaUnit")}>
                  {UREA_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {errors.urea && <small className="field-error">{errors.urea.message}</small>}
            </label>

            <label className="field">
              Kalium
              <div className="unit-input">
                <input
                  type="number"
                  step="0.1"
                  placeholder="contoh: 4.5"
                  {...register("potassium")}
                />
                <span>mmol/L</span>
              </div>
              {errors.potassium && (
                <small className="field-error">{errors.potassium.message}</small>
              )}
            </label>

            <label className="field">
              ACR
              <div className="unit-input">
                <input type="number" step="any" placeholder="contoh: 35" {...register("acr")} />
                <select aria-label="Satuan ACR" {...register("acrUnit")}>
                  {ACR_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {errors.acr && <small className="field-error">{errors.acr.message}</small>}
            </label>
          </div>

          <details open={Boolean(editingLab?.reference_notes)}>
            <summary>
              Masukkan rentang normal dari lembar lab Anda{" "}
              <ChevronDown size={18} strokeWidth={1.8} />
            </summary>
            <textarea
              placeholder="Tambahkan rentang normal atau catatan lain..."
              {...register("referenceNotes")}
            />
            {errors.referenceNotes && (
              <small className="field-error block mb-3">{errors.referenceNotes.message}</small>
            )}
          </details>

          <label className="check-row">
            <input type="checkbox" {...register("isAcuteIllness")} />
            <span>
              <b>Hasil diambil saat saya sakit akut / dirawat</b>
              <small>Kondisi ini dapat membuat eGFR kurang stabil.</small>
            </span>
            <Info size={20} strokeWidth={1.8} />
          </label>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : editingLab
                  ? "Simpan perubahan"
                  : "Simpan hasil lab"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  row,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  row: LabRowDisplay;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-lab-title">
        <div className="modal-head">
          <div>
            <span className="label">KONFIRMASI HAPUS</span>
            <h2 id="delete-lab-title">Hapus hasil lab ini?</h2>
            <p>
              Hasil pemeriksaan tanggal <b>{row.formattedDate}</b> (eGFR {row.egfrText}) akan
              dihapus permanen dan tidak dapat dikembalikan.
            </p>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {error && <Alert variant="critical" title="Gagal menghapus" description={error} />}

        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Menghapus..." : "Ya, hapus hasil lab"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LabView({
  initialLabs,
  initialError = null,
}: {
  initialLabs: LabResult[];
  initialError?: string | null;
}) {
  const router = useRouter();
  const [labs, setLabs] = useState<LabResult[]>(initialLabs);
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; editing: LabResult | null }
  >({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<LabRowDisplay | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [tab, setTab] = useState<LabMetricTab>("eGFR");
  const [period, setPeriod] = useState<LabPeriod>("6 Bln");
  const [sortOrder, setSortOrder] = useState<LabSortOrder>("newest");

  const trend = useMemo(
    () => buildLabTrendSeries(labs, tab, period),
    [labs, tab, period]
  );

  const sortedNewest = useMemo(() => sortLabRows(labs, "newest"), [labs]);
  const newestId = sortedNewest[0]?.id ?? null;

  const displayRows = useMemo(() => {
    const ordered = sortOrder === "newest" ? sortedNewest : sortLabRows(labs, "oldest");
    return ordered.map((lab) => getLabRowDisplay(lab, lab.id === newestId));
  }, [labs, sortedNewest, newestId, sortOrder]);

  const handleSaved = (saved: LabResult, mode: "create" | "edit") => {
    setLabs((prev) =>
      mode === "create"
        ? [saved, ...prev]
        : prev.map((item) => (item.id === saved.id ? saved : item))
    );
    setModalState({ open: false });
    router.refresh();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteLabResultAction(deleteTarget.id);
      if (!res.ok) {
        setDeleteError(res.error);
        return;
      }
      setLabs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Riwayat Lab"
          subtitle="Pantau perubahan hasil laboratorium Anda dari waktu ke waktu."
        />
        <Button onClick={() => setModalState({ open: true, editing: null })}>
          <Plus size={19} strokeWidth={1.8} /> Catat hasil lab
        </Button>
      </div>

      {initialError && (
        <Alert
          variant="critical"
          title="Gagal memuat riwayat lab"
          description={initialError}
        >
          <button type="button" onClick={() => router.refresh()}>
            Muat ulang halaman
          </button>
        </Alert>
      )}

      {!initialError && labs.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-lab-icon">
            <FlaskConical size={28} strokeWidth={1.8} />
          </div>
          <h3>Belum ada hasil lab tercatat</h3>
          <p className="empty-lab-desc">
            Catat hasil pemeriksaan kreatinin, ureum, kalium, atau ACR pertama Anda untuk
            melihat perkiraan eGFR, stage G/A, dan grafik tren dari waktu ke waktu.
          </p>
          <Button onClick={() => setModalState({ open: true, editing: null })}>
            <Plus size={19} strokeWidth={1.8} /> Catat hasil lab pertama
          </Button>
        </Card>
      ) : (
        <>
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
                <h3>{trend.headline}</h3>
                <p>{trend.subtitle}</p>
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

            {trend.latestIsPotassiumCritical && (
              <div className="mt-3">
                <Alert
                  variant="critical"
                  title="Nilai kalium terakhir sangat tinggi dan dapat berbahaya"
                  description="Hubungi dokter atau layanan darurat segera."
                />
              </div>
            )}

            {tab === "eGFR" && trend.latestIsAcute && (
              <div className="acute-banner">
                <Info size={18} strokeWidth={1.8} />
                <span>
                  Hasil eGFR terbaru diambil saat kondisi <b>sakit akut / dirawat</b>. Kondisi
                  ini dapat membuat eGFR kurang stabil.
                </span>
              </div>
            )}

            {trend.points.length === 0 ? (
              <div className="chart-empty">
                <p>
                  Belum ada data <b>{tab}</b> pada periode <b>{period}</b>.
                </p>
                {period !== "Semua" && (
                  <Button variant="outline" onClick={() => setPeriod("Semua")}>
                    Tampilkan semua periode
                  </Button>
                )}
              </div>
            ) : (
              <TrendChart
                data={trend.points}
                metric={tab}
                unit={trend.unit}
                domain={trend.domain}
              />
            )}

            {tab === "eGFR" && trend.points.length > 0 && (
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
                onChange={(e) => setSortOrder(e.target.value as LabSortOrder)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>

            <div className="lab-list">
              {displayRows.map((r) => (
                <div className="lab-row-card" key={r.id}>
                  <div className="lab-row">
                    <div className="lab-date">
                      <div className="lab-date-head">
                        <b>{r.formattedDate}</b>
                        {r.stageBadge && (
                          <span className="stage-pill">{r.stageBadge}</span>
                        )}
                      </div>
                      <span>{r.isLatest ? "Terbaru" : "Hasil rutin"}</span>
                    </div>
                    <div>
                      <small>eGFR</small>
                      <b>{r.egfrText}</b>
                    </div>
                    <div>
                      <small>Kreatinin</small>
                      <b>{r.creatinineText}</b>
                    </div>
                    <div className="hide-mobile">
                      <small>ACR</small>
                      <b>{r.acrText}</b>
                    </div>
                    <div className="hide-mobile">
                      <small>Kalium</small>
                      <b className={r.potassiumCritical ? "text-danger" : ""}>
                        {r.potassiumText}
                      </b>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        aria-label={`Edit hasil lab ${r.formattedDate}`}
                        onClick={() => setModalState({ open: true, editing: r.raw })}
                      >
                        <Pencil size={18} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus hasil lab ${r.formattedDate}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(r);
                        }}
                      >
                        <Trash2 size={18} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  {(r.isAcuteIllness || r.potassiumCritical || r.referenceNotes) && (
                    <div className="lab-row-meta">
                      {r.isAcuteIllness && (
                        <span className="acute-note-pill">
                          <Info size={14} strokeWidth={1.8} />
                          <span>
                            Diambil saat sakit akut / dirawat — kondisi ini dapat membuat eGFR
                            kurang stabil.
                          </span>
                        </span>
                      )}
                      {r.potassiumCritical && (
                        <span className="critical-note-pill">
                          <AlertTriangle size={14} strokeWidth={1.8} />
                          <span>Kalium sangat tinggi (≥ 6 mmol/L) — segera hubungi dokter.</span>
                        </span>
                      )}
                      {r.referenceNotes && (
                        <span className="ref-note-text">Catatan: {r.referenceNotes}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {modalState.open && (
        <LabFormModal
          editingLab={modalState.editing}
          onClose={() => setModalState({ open: false })}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          row={deleteTarget}
          deleting={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (!isDeleting) setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
