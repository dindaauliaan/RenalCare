"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ChevronRight,
  HeartPulse,
  Info,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  createBpLogAction,
  deleteBpLogAction,
  updateBpLogAction,
  updateBpTargetAction,
} from "@/app/(app)/tekanan-darah/actions";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { isBloodPressureCritical } from "@/lib/clinical";
import {
  buildLast7DaysMiniBars,
  compareAverageAgainstTarget,
  computeBpPeriodAverages,
  formatBpLogRow,
  sortBpLogs,
  type BpRowDisplay,
  type BpTarget,
} from "@/lib/bp/processing";
import {
  bpFormSchema,
  bpTargetSchema,
  getCurrentDateTimeLocalWib,
  isoToWibDateTimeLocal,
  parseIntInputString,
  type BpFormValues,
  type BpTargetFormValues,
} from "@/lib/bp/schemas";
import type { BpLog } from "@/types/database";

function checkLiveCriticalBp(sysStr: string, diaStr: string): boolean {
  const sys = parseIntInputString(sysStr);
  const dia = parseIntInputString(diaStr);
  const validSys = sys !== null && !Number.isNaN(sys) && sys > 0 ? sys : null;
  const validDia = dia !== null && !Number.isNaN(dia) && dia > 0 ? dia : null;

  if (validSys === null && validDia === null) return false;
  return isBloodPressureCritical({
    systolic: validSys ?? 120,
    diastolic: validDia ?? 80,
  });
}

function BpGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="bp-guide-title">
        <div className="modal-head">
          <div>
            <span className="label">PANDUAN PENGUKURAN</span>
            <h2 id="bp-guide-title">Cara mengukur tekanan darah di rumah</h2>
            <p>Langkah praktis agar hasil pengukuran lebih konsisten dan akurat.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        <ol className="guide-steps">
          <li>
            <b>Istirahat tenang 5 menit sebelum mengukur</b>
            <p>Hindari kafein, merokok, atau olahraga berat setidaknya 30 menit sebelumnya.</p>
          </li>
          <li>
            <b>Duduk dengan posisi yang benar</b>
            <p>
              Punggung bersandar pada kursi, kedua kaki menapak rata di lantai (tidak
              menyilang), dan jangan berbicara saat alat bekerja.
            </p>
          </li>
          <li>
            <b>Posisikan lengan setinggi jantung</b>
            <p>
              Letakkan lengan di atas meja dengan manset terpasang pas pada kulit lengan atas
              (bukan di atas pakaian tebal).
            </p>
          </li>
          <li>
            <b>Ukur pada waktu yang konsisten &amp; catat</b>
            <p>
              Usahakan mengukur di jam yang sama setiap hari dan catat hasil beserta lengan
              serta posisi yang digunakan.
            </p>
          </li>
        </ol>

        <div className="article-note">
          <Info size={20} strokeWidth={1.8} />
          <p>
            <b>Sumber: KDIGO 2024 / AHA</b>{" "}
            <span className="review-tag">PERLU DIVERIFIKASI tenaga kesehatan</span> —
            Sesuaikan teknik dan frekuensi pengukuran dengan anjuran dokter Anda.
          </p>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose}>Mengerti</Button>
        </div>
      </div>
    </div>
  );
}

function TargetModal({
  currentTarget,
  onClose,
  onSaved,
}: {
  currentTarget: BpTarget | null;
  onClose: () => void;
  onSaved: (target: BpTarget) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BpTargetFormValues>({
    resolver: zodResolver(bpTargetSchema),
    defaultValues: {
      targetSystolic: currentTarget ? String(currentTarget.systolic) : "",
      targetDiastolic: currentTarget ? String(currentTarget.diastolic) : "",
    },
  });

  const onSubmit = async (values: BpTargetFormValues) => {
    setServerError(null);
    const res = await updateBpTargetAction(values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    onSaved(res.target);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="bp-target-title">
        <div className="modal-head">
          <div>
            <span className="label">TARGET TEKANAN DARAH</span>
            <h2 id="bp-target-title">Atur target dari dokter</h2>
            <p>Isi batas target sistolik dan diastolik yang dianjurkan oleh dokter Anda.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {serverError && (
          <Alert variant="critical" title="Gagal menyimpan target" description={serverError} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <label className="field">
              Target sistolik (mmHg)
              <input
                type="number"
                placeholder="contoh: 130"
                {...register("targetSystolic")}
              />
              {errors.targetSystolic && (
                <small className="field-error">{errors.targetSystolic.message}</small>
              )}
            </label>
            <label className="field">
              Target diastolik (mmHg)
              <input
                type="number"
                placeholder="contoh: 80"
                {...register("targetDiastolic")}
              />
              {errors.targetDiastolic && (
                <small className="field-error">{errors.targetDiastolic.message}</small>
              )}
            </label>
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan target"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBpModal({
  editingLog,
  onClose,
  onUpdated,
}: {
  editingLog: BpLog;
  onClose: () => void;
  onUpdated: (updated: BpLog) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BpFormValues>({
    resolver: zodResolver(bpFormSchema),
    defaultValues: {
      systolic: String(editingLog.systolic),
      diastolic: String(editingLog.diastolic),
      pulse: editingLog.pulse === null ? "" : String(editingLog.pulse),
      arm: editingLog.arm === "right" ? "right" : "left",
      position:
        editingLog.position === "standing" || editingLog.position === "lying"
          ? editingLog.position
          : "sitting",
      measuredAt: isoToWibDateTimeLocal(editingLog.measured_at),
    },
  });

  const [sysVal, diaVal] = useWatch({ control, name: ["systolic", "diastolic"] });
  const critical = checkLiveCriticalBp(sysVal ?? "", diaVal ?? "");

  const onSubmit = async (values: BpFormValues) => {
    setServerError(null);
    const res = await updateBpLogAction(editingLog.id, values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    onUpdated(res.data);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="bp-edit-title">
        <div className="modal-head">
          <div>
            <span className="label">PERBARUI CATATAN</span>
            <h2 id="bp-edit-title">Edit pengukuran tekanan darah</h2>
            <p>Perbaiki angka atau detail pengukuran Anda lalu simpan.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {critical && (
          <Alert
            variant="critical"
            title="Tekanan darah Anda sangat tinggi"
            description="Duduk tenang dan ukur ulang setelah 5 menit. Jika tetap tinggi atau ada nyeri dada/sesak, segera ke IGD."
          />
        )}

        {serverError && (
          <Alert variant="critical" title="Gagal memperbarui" description={serverError} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bp-inputs">
            <label>
              Sistolik
              <input type="number" placeholder="120" {...register("systolic")} />
              <small>mmHg</small>
            </label>
            <span>/</span>
            <label>
              Diastolik
              <input type="number" placeholder="80" {...register("diastolic")} />
              <small>mmHg</small>
            </label>
          </div>
          {(errors.systolic || errors.diastolic) && (
            <div className="mb-4 grid gap-1">
              {errors.systolic && (
                <small className="field-error">{errors.systolic.message}</small>
              )}
              {errors.diastolic && (
                <small className="field-error">{errors.diastolic.message}</small>
              )}
            </div>
          )}

          <div className="form-grid compact">
            <label className="field">
              Denyut nadi (opsional)
              <input type="number" placeholder="72 kali/menit" {...register("pulse")} />
              {errors.pulse && <small className="field-error">{errors.pulse.message}</small>}
            </label>
            <label className="field">
              Lengan
              <select {...register("arm")}>
                <option value="left">Kiri</option>
                <option value="right">Kanan</option>
              </select>
            </label>
            <label className="field">
              Posisi
              <select {...register("position")}>
                <option value="sitting">Duduk</option>
                <option value="standing">Berdiri</option>
                <option value="lying">Berbaring</option>
              </select>
            </label>
            <label className="field">
              Tanggal &amp; jam
              <input type="datetime-local" {...register("measuredAt")} />
              {errors.measuredAt && (
                <small className="field-error">{errors.measuredAt.message}</small>
              )}
            </label>
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteBpConfirmModal({
  row,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  row: BpRowDisplay;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-bp-title">
        <div className="modal-head">
          <div>
            <span className="label">KONFIRMASI HAPUS</span>
            <h2 id="delete-bp-title">Hapus catatan tensi ini?</h2>
            <p>
              Pengukuran <b>{row.systolic}/{row.diastolic} mmHg</b> ({row.formattedTime}) akan
              dihapus permanen.
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
            {deleting ? "Menghapus..." : "Ya, hapus catatan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BloodPressureView({
  initialLogs,
  initialTarget,
  initialError = null,
}: {
  initialLogs: BpLog[];
  initialTarget: BpTarget | null;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<BpLog[]>(initialLogs);
  const [target, setTarget] = useState<BpTarget | null>(initialTarget);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [guideOpen, setGuideOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<BpLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BpRowDisplay | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BpFormValues>({
    resolver: zodResolver(bpFormSchema),
    defaultValues: {
      systolic: "",
      diastolic: "",
      pulse: "",
      arm: "left",
      position: "sitting",
      measuredAt: getCurrentDateTimeLocalWib(),
    },
  });

  const [sysInput, diaInput] = useWatch({ control, name: ["systolic", "diastolic"] });
  const liveCritical = checkLiveCriticalBp(sysInput ?? "", diaInput ?? "");

  const { avg7Days, avg30Days } = useMemo(() => computeBpPeriodAverages(logs), [logs]);
  const miniBars = useMemo(() => buildLast7DaysMiniBars(logs), [logs]);
  const targetComparison = useMemo(
    () => (target ? compareAverageAgainstTarget({ avg7Days, avg30Days, target }) : null),
    [avg7Days, avg30Days, target]
  );

  const displayRows = useMemo(
    () => sortBpLogs(logs, sortOrder).map((log) => formatBpLogRow(log)),
    [logs, sortOrder]
  );

  const onCreateSubmit = async (values: BpFormValues) => {
    setFormError(null);
    setSaveSuccess(null);

    const res = await createBpLogAction(values);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }

    setLogs((prev) => [res.data, ...prev]);
    reset({
      systolic: "",
      diastolic: "",
      pulse: "",
      arm: values.arm,
      position: values.position,
      measuredAt: getCurrentDateTimeLocalWib(),
    });
    setSaveSuccess("Pengukuran tekanan darah berhasil dicatat.");
    router.refresh();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteBpLogAction(deleteTarget.id);
      if (!res.ok) {
        setDeleteError(res.error);
        return;
      }
      setLogs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const avg7IsCritical =
    avg7Days !== null &&
    isBloodPressureCritical({
      systolic: avg7Days.systolic,
      diastolic: avg7Days.diastolic,
    });

  return (
    <div className="page">
      <PageTitle
        title="Tekanan Darah"
        subtitle="Catat secara rutin agar dokter dapat melihat pola tekanan darah Anda."
      />

      {initialError && (
        <Alert
          variant="critical"
          title="Gagal memuat data tekanan darah"
          description={initialError}
        >
          <button type="button" onClick={() => router.refresh()}>
            Muat ulang halaman
          </button>
        </Alert>
      )}

      <button type="button" className="guide-banner" onClick={() => setGuideOpen(true)}>
        <span>
          <Info size={22} strokeWidth={1.8} />
        </span>
        <div>
          <b>Panduan cara ukur tekanan darah yang benar</b>
          <small>Duduk tenang, kaki menapak, lengan setinggi jantung. Klik untuk membaca.</small>
        </div>
        <ChevronRight size={22} strokeWidth={1.8} />
      </button>

      {liveCritical && (
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

          {formError && (
            <Alert variant="critical" title="Gagal menyimpan" description={formError} />
          )}
          {saveSuccess && (
            <div className="bp-success-banner" role="status">
              {saveSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit(onCreateSubmit)} noValidate>
            <div className="bp-inputs">
              <label>
                Sistolik
                <input type="number" placeholder="120" {...register("systolic")} />
                <small>mmHg</small>
              </label>
              <span>/</span>
              <label>
                Diastolik
                <input type="number" placeholder="80" {...register("diastolic")} />
                <small>mmHg</small>
              </label>
            </div>
            {(errors.systolic || errors.diastolic) && (
              <div className="mb-4 grid gap-1">
                {errors.systolic && (
                  <small className="field-error">{errors.systolic.message}</small>
                )}
                {errors.diastolic && (
                  <small className="field-error">{errors.diastolic.message}</small>
                )}
              </div>
            )}

            <div className="form-grid compact">
              <label className="field">
                Denyut nadi (opsional)
                <input type="number" placeholder="72 kali/menit" {...register("pulse")} />
                {errors.pulse && <small className="field-error">{errors.pulse.message}</small>}
              </label>
              <label className="field">
                Lengan
                <select {...register("arm")}>
                  <option value="left">Kiri</option>
                  <option value="right">Kanan</option>
                </select>
              </label>
              <label className="field">
                Posisi
                <select {...register("position")}>
                  <option value="sitting">Duduk</option>
                  <option value="standing">Berdiri</option>
                  <option value="lying">Berbaring</option>
                </select>
              </label>
              <label className="field">
                Tanggal &amp; jam
                <input type="datetime-local" {...register("measuredAt")} />
                {errors.measuredAt && (
                  <small className="field-error">{errors.measuredAt.message}</small>
                )}
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="full-btn">
              {isSubmitting ? "Menyimpan..." : "Simpan pengukuran"}
            </Button>
          </form>
        </Card>

        <div className="side-stack">
          <Card>
            <div className="card-heading">
              <div>
                <span className="label">RATA-RATA 7 HARI</span>
                <h3>Tekanan darah</h3>
              </div>
              <span className={`soft-badge ${avg7IsCritical ? "critical" : ""}`}>
                {avg7Days
                  ? avg7IsCritical
                    ? "Perlu perhatian"
                    : `${avg7Days.count} catatan`
                  : "Belum ada data"}
              </span>
            </div>

            {avg7Days ? (
              <div className="average">
                <b>{avg7Days.systolic}</b>
                <span>/</span>
                <b>{avg7Days.diastolic}</b>
                <small>mmHg</small>
              </div>
            ) : (
              <div className="average empty">
                <b>—</b>
                <span>/</span>
                <b>—</b>
                <small>mmHg</small>
              </div>
            )}

            <div className="mini-bars-wrap">
              <div className="mini-bars">
                {miniBars.map((bar) => (
                  <i
                    key={bar.dayKey}
                    className={bar.hasData ? "" : "empty"}
                    style={{ height: bar.heightPx }}
                    title={
                      bar.hasData
                        ? `${bar.dayKey}: ${bar.avgSystolic}/${bar.avgDiastolic} mmHg`
                        : `${bar.dayKey}: Belum ada catatan`
                    }
                  />
                ))}
              </div>
              <div className="mini-bars-labels" aria-hidden="true">
                {miniBars.map((bar) => (
                  <span key={bar.dayKey}>{bar.label}</span>
                ))}
              </div>
            </div>

            <p className="muted">
              Rata-rata 30 hari:{" "}
              <b>
                {avg30Days
                  ? `${avg30Days.systolic}/${avg30Days.diastolic} mmHg (${avg30Days.count} catatan)`
                  : "Belum ada data"}
              </b>
            </p>
          </Card>

          {target ? (
            <Card className="target-card">
              <div className="card-heading">
                <div>
                  <span className="label">TARGET DARI DOKTER</span>
                  <h3>
                    {target.systolic}/{target.diastolic} mmHg
                  </h3>
                </div>
                {targetComparison && (
                  <span
                    className={`soft-badge ${
                      targetComparison.status === "above" ? "warning" : ""
                    }`}
                  >
                    {targetComparison.badgeText}
                  </span>
                )}
              </div>

              <p className="target-detail">
                {targetComparison
                  ? targetComparison.detailText
                  : "Catat pengukuran tekanan darah untuk melihat perbandingan terhadap target dokter."}
              </p>

              <Button variant="outline" onClick={() => setTargetModalOpen(true)}>
                Ubah Target
              </Button>
            </Card>
          ) : (
            <Card className="target-empty">
              <div className="empty-icon">
                <TrendingUp size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h3>Target dari dokter</h3>
                <p>Belum ada target tekanan darah. Tanyakan ke dokter, lalu isi di sini.</p>
              </div>
              <Button variant="outline" onClick={() => setTargetModalOpen(true)}>
                Atur Target
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <div className="card-heading">
          <div>
            <span className="label">SEMUA CATATAN</span>
            <h3>Riwayat pengukuran</h3>
          </div>
          {logs.length > 0 && (
            <select
              className="small-select"
              aria-label="Urutan riwayat tekanan darah"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          )}
        </div>

        {displayRows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-lab-icon">
              <HeartPulse size={26} strokeWidth={1.8} />
            </div>
            <h3>Belum ada catatan tekanan darah</h3>
            <p className="empty-lab-desc">
              Gunakan formulir di atas untuk mencatat pengukuran tekanan darah pertama Anda hari
              ini.
            </p>
          </div>
        ) : (
          <div className="lab-list">
            {displayRows.map((row) => (
              <div className="bp-row-card" key={row.id}>
                <div className="bp-row">
                  <div className="bp-row-main">
                    <div className="lab-date-head">
                      <b className={row.isCritical ? "text-danger" : ""}>
                        {row.systolic}/{row.diastolic} mmHg
                      </b>
                      {row.isCritical && (
                        <span className="critical-note-pill">
                          <AlertTriangle size={13} strokeWidth={1.8} />
                          <span>Sangat tinggi</span>
                        </span>
                      )}
                    </div>
                    <span className="bp-row-time">{row.formattedTime}</span>
                  </div>

                  <div>
                    <small>Nadi</small>
                    <b>{row.pulseText}</b>
                  </div>
                  <div className="hide-mobile">
                    <small>Lengan</small>
                    <b>{row.armLabel}</b>
                  </div>
                  <div className="hide-mobile">
                    <small>Posisi</small>
                    <b>{row.positionLabel}</b>
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      aria-label={`Edit tekanan darah ${row.formattedTime}`}
                      onClick={() => setEditingLog(row.raw)}
                    >
                      <Pencil size={18} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus tekanan darah ${row.formattedTime}`}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(row);
                      }}
                    >
                      <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {guideOpen && <BpGuideModal onClose={() => setGuideOpen(false)} />}

      {targetModalOpen && (
        <TargetModal
          currentTarget={target}
          onClose={() => setTargetModalOpen(false)}
          onSaved={(savedTarget) => {
            setTarget(savedTarget);
            setTargetModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {editingLog && (
        <EditBpModal
          editingLog={editingLog}
          onClose={() => setEditingLog(null)}
          onUpdated={(updated) => {
            setLogs((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
            setEditingLog(null);
            router.refresh();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteBpConfirmModal
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
