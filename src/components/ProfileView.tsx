"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import {
  deleteMyAccountAction,
  exportMyHealthDataAction,
  type ExportHealthDataResult,
} from "@/app/(app)/profil/actions";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LogoutButton } from "@/components/LogoutButton";
import { PageTitle } from "@/components/PageTitle";
import { DELETE_CONFIRMATION_PHRASE } from "@/lib/profile/deleteAccount";

interface ProfileViewProps {
  profileData: {
    fullName: string;
    email: string;
    initials: string;
    birthDate: string | null;
    sex: "female" | "male" | null;
    mode: "ckd" | "post_aki" | null;
    bpTargetSystolic: number | null;
    bpTargetDiastolic: number | null;
  };
  stats: {
    labCount: number;
    bpCount: number;
    reminderCount: number;
  };
}

function formatBirthDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function triggerCsvDownload(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ProfileView({ profileData, stats }: ProfileViewProps) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] =
    useState<ExportHealthDataResult | null>(null);

  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteConfirmedCheck, setDeleteConfirmedCheck] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExportBoth() {
    setExporting(true);
    setExportError(null);

    try {
      const res = await exportMyHealthDataAction();
      if (!res.ok || !res.labCsv || !res.bpCsv || !res.filenames) {
        setExportError(res.error ?? "Gagal menyiapkan file CSV.");
        return;
      }

      setExportResult(res);
      triggerCsvDownload(res.labCsv, res.filenames.lab);
      setTimeout(() => {
        if (res.bpCsv && res.filenames) {
          triggerCsvDownload(res.bpCsv, res.filenames.bp);
        }
      }, 250);
    } catch {
      setExportError("Terjadi kendala saat mengekspor data Anda.");
    } finally {
      setExporting(false);
    }
  }

  function handleResetDeleteFlow() {
    setDeleteStep(0);
    setDeletePhrase("");
    setDeleteConfirmedCheck(false);
    setDeleteError(null);
  }

  async function handleFinalDeleteRequest(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (
      deletePhrase.trim() !== DELETE_CONFIRMATION_PHRASE ||
      !deleteConfirmedCheck
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteMyAccountAction({
        phrase: deletePhrase,
        acknowledged: deleteConfirmedCheck,
      });

      if (!res.ok) {
        setDeleteError(res.error ?? "Gagal menghapus akun.");
        return;
      }

      router.push("/login?deleted=1");
      router.refresh();
    } catch {
      setDeleteError("Terjadi kendala jaringan saat mencoba menghapus akun.");
    } finally {
      setDeleting(false);
    }
  }

  const modeLabel =
    profileData.mode === "post_aki"
      ? "Pemulihan Pasca-AKI"
      : profileData.mode === "ckd"
        ? "Penyakit Ginjal Kronis (CKD / PGK)"
        : "Belum dipilih";

  const sexLabel =
    profileData.sex === "female"
      ? "Perempuan"
      : profileData.sex === "male"
        ? "Laki-laki"
        : "-";

  const bpTargetLabel =
    profileData.bpTargetSystolic !== null &&
    profileData.bpTargetDiastolic !== null
      ? `< ${profileData.bpTargetSystolic}/${profileData.bpTargetDiastolic} mmHg`
      : "Belum diisi (isi di menu Tekanan Darah)";

  const phraseValid = deletePhrase.trim() === DELETE_CONFIRMATION_PHRASE;

  return (
    <div className="page profile-page">
      <PageTitle
        title="Profil & Hak Data"
        subtitle="Informasi akun, ringkasan data kesehatan yang tersimpan, ekspor CSV, dan pengelolaan penghapusan akun."
      />

      <div className="profile-grid">
        <Card>
          <div className="profile-identity-head">
            <div className="avatar profile-avatar">{profileData.initials}</div>
            <div>
              <h2>{profileData.fullName}</h2>
              <p className="profile-email">{profileData.email}</p>
            </div>
            <div className="profile-logout-slot">
              <LogoutButton variant="inline" />
            </div>
          </div>

          <dl className="profile-facts">
            <div>
              <dt>Tanggal lahir</dt>
              <dd>{formatBirthDate(profileData.birthDate)}</dd>
            </div>
            <div>
              <dt>Jenis kelamin (rumus eGFR)</dt>
              <dd>{sexLabel}</dd>
            </div>
            <div>
              <dt>Mode pemantauan</dt>
              <dd>{modeLabel}</dd>
            </div>
            <div>
              <dt>Target tekanan darah dokter</dt>
              <dd>{bpTargetLabel}</dd>
            </div>
          </dl>

          <div className="profile-doc-links">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Dokumen terkait:</span>
            <Link href="/privasi" className="text-link">
              Kebijakan Privasi (DRAF)
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/syarat" className="text-link">
              Syarat &amp; Ketentuan (DRAF)
            </Link>
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h3>
              <FileSpreadsheet size={18} aria-hidden="true" /> Ekspor data saya
            </h3>
            <span className="soft-badge">Format CSV</span>
          </div>

          <p className="profile-section-desc">
            Unduh salinan catatan riwayat laboratorium dan tekanan darah Anda
            dalam format CSV yang dapat dibuka di Excel atau Google Sheets.
          </p>

          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <b>{stats.labCount}</b>
              <span>Catatan lab</span>
            </div>
            <div className="profile-stat-box">
              <b>{stats.bpCount}</b>
              <span>Catatan tekanan darah</span>
            </div>
            <div className="profile-stat-box">
              <b>{stats.reminderCount}</b>
              <span>Agenda pengingat</span>
            </div>
          </div>

          {exportError && (
            <Alert
              variant="critical"
              title="Ekspor gagal"
              description={exportError}
            />
          )}

          {exportResult?.ok && exportResult.filenames && (
            <div className="export-success-box">
              <div className="export-success-head">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  CSV siap: <b>{exportResult.labCount ?? 0}</b> data lab dan{" "}
                  <b>{exportResult.bpCount ?? 0}</b> data tekanan darah.
                </span>
              </div>
              <div className="export-individual-actions">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    if (exportResult.labCsv && exportResult.filenames) {
                      triggerCsvDownload(
                        exportResult.labCsv,
                        exportResult.filenames.lab,
                      );
                    }
                  }}
                >
                  Unduh ulang CSV Lab
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    if (exportResult.bpCsv && exportResult.filenames) {
                      triggerCsvDownload(
                        exportResult.bpCsv,
                        exportResult.filenames.bp,
                      );
                    }
                  }}
                >
                  Unduh ulang CSV Tekanan Darah
                </button>
              </div>
            </div>
          )}

          <div className="profile-actions-row">
            <Button
              type="button"
              onClick={handleExportBoth}
              disabled={exporting}
            >
              <Download size={16} aria-hidden="true" />
              {exporting ? "Menyiapkan CSV..." : "Ekspor data saya"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="danger-zone-card">
        <div className="card-head">
          <h3>
            <User size={18} aria-hidden="true" /> Penghapusan Akun &amp; Data
          </h3>
          <span className="danger-pill">Konfirmasi 2 langkah</span>
        </div>

        <p className="profile-section-desc">
          Menghapus akun akan menghilangkan profil, seluruh hasil lab, catatan
          tekanan darah, agenda pengingat, dan kredensial login Anda secara
          permanen. Disarankan untuk mengekspor data CSV Anda terlebih dahulu.
        </p>

        {deleteStep === 0 && (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setDeleteError(null);
              setDeleteStep(1);
            }}
          >
            <Trash2 size={16} aria-hidden="true" /> Hapus akun dan semua data
            saya
          </Button>
        )}

        {deleteStep === 1 && (
          <div className="delete-confirm-box">
            <Alert
              variant="critical"
              title="Langkah 1 dari 2: Pastikan Anda benar-benar ingin menghapus akun"
              description="Tindakan ini tidak dapat dibatalkan. Semua riwayat lab, catatan tekanan darah, agenda kontrol, dan profil akan ikut terhapus."
            />
            <div className="delete-confirm-actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDeleteFlow}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => setDeleteStep(2)}
              >
                Lanjutkan ke konfirmasi akhir
              </Button>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <form className="delete-confirm-box" onSubmit={handleFinalDeleteRequest}>
            <div className="delete-step-banner">
              <AlertTriangle size={18} aria-hidden="true" />
              <b>Langkah 2 dari 2: Konfirmasi akhir penghapusan permanen</b>
            </div>

            <label className="field">
              Ketik <b>HAPUS AKUN SAYA</b> untuk melanjutkan:
              <input
                type="text"
                value={deletePhrase}
                onChange={(event) => setDeletePhrase(event.target.value)}
                placeholder="HAPUS AKUN SAYA"
                autoComplete="off"
              />
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={deleteConfirmedCheck}
                onChange={(event) =>
                  setDeleteConfirmedCheck(event.target.checked)
                }
              />
              <span>
                <small>
                  Saya memahami bahwa seluruh data kesehatan saya tidak dapat
                  dipulihkan setelah akun dihapus.
                </small>
              </span>
            </label>

            {deleteError && (
              <Alert
                variant="critical"
                title="Penghapusan akun belum dapat diselesaikan"
                description={deleteError}
              />
            )}

            <div className="delete-confirm-actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDeleteFlow}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={!phraseValid || !deleteConfirmedCheck || deleting}
              >
                {deleting ? "Menghapus akun..." : "Konfirmasi Hapus Akun Permanen"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
