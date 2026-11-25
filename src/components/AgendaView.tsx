"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Calendar,
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  createReminderAction,
  deleteReminderAction,
  toggleReminderDoneAction,
  updateReminderAction,
} from "@/app/(app)/agenda/actions";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import {
  groupAndCountReminders,
  type AgendaTab,
  type ClassifiedReminder,
  type LabIntervalRecommendation,
} from "@/lib/agenda/processing";
import {
  getTomorrowMorningWib,
  isoToWibDateTimeLocal,
  reminderFormSchema,
  type ReminderFormValues,
  type ReminderTypeOption,
} from "@/lib/agenda/schemas";
import type { Reminder } from "@/types/database";

const TYPE_CHOICES: Array<{
  value: ReminderTypeOption;
  label: string;
  hint: string;
}> = [
  { value: "control", label: "Kontrol dokter", hint: "Jadwal konsultasi dokter" },
  { value: "lab", label: "Pemeriksaan lab", hint: "Cek darah / urin" },
  { value: "medication", label: "Obat", hint: "Resep / minum obat" },
];

type ModalMode =
  | { open: false }
  | { open: true; editing: Reminder | null; initialValues: ReminderFormValues };

function ReminderFormModal({
  editing,
  initialValues,
  onClose,
  onSaved,
}: {
  editing: Reminder | null;
  initialValues: ReminderFormValues;
  onClose: () => void;
  onSaved: (saved: Reminder, mode: "create" | "edit") => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: initialValues,
  });

  const selectedType = useWatch({ control, name: "type" });

  const onSubmit = async (values: ReminderFormValues) => {
    setServerError(null);
    const res = editing
      ? await updateReminderAction(editing.id, values)
      : await createReminderAction(values);

    if (!res.ok) {
      setServerError(res.error);
      return;
    }

    onSaved(res.data, editing ? "edit" : "create");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reminder-modal-title">
        <div className="modal-head">
          <div>
            <span className="label">{editing ? "PERBARUI AGENDA" : "AGENDA BARU"}</span>
            <h2 id="reminder-modal-title">
              {editing ? "Edit pengingat" : "Tambah pengingat"}
            </h2>
            <p>Simpan jadwal kontrol, pemeriksaan lab, atau pengambilan obat Anda.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {serverError && (
          <Alert variant="critical" title="Gagal menyimpan pengingat" description={serverError} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="field">
            <span>Jenis pengingat</span>
            <div className="type-choice-grid">
              {TYPE_CHOICES.map((choice) => (
                <label
                  key={choice.value}
                  className={`choice-card ${selectedType === choice.value ? "selected" : ""}`}
                >
                  <input type="radio" value={choice.value} {...register("type")} />
                  <b>{choice.label}</b>
                  <small>{choice.hint}</small>
                </label>
              ))}
            </div>
            {errors.type && <small className="field-error">{errors.type.message}</small>}
          </div>

          <label className="field">
            Judul pengingat
            <input
              type="text"
              placeholder="contoh: Kontrol dokter ginjal"
              {...register("title")}
            />
            {errors.title && <small className="field-error">{errors.title.message}</small>}
          </label>

          <div className="form-grid">
            <label className="field">
              Tanggal &amp; jam
              <input type="datetime-local" {...register("remindAt")} />
              {errors.remindAt && (
                <small className="field-error">{errors.remindAt.message}</small>
              )}
            </label>
            <label className="field">
              Lokasi (opsional)
              <input
                type="text"
                placeholder="contoh: RS Harapan Sehat"
                {...register("location")}
              />
              {errors.location && (
                <small className="field-error">{errors.location.message}</small>
              )}
            </label>
          </div>

          <label className="field">
            Catatan (opsional)
            <textarea
              className="agenda-textarea"
              placeholder="contoh: Bawa hasil lab terakhir dan daftar obat."
              {...register("notes")}
            />
            {errors.notes && <small className="field-error">{errors.notes.message}</small>}
          </label>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : editing
                  ? "Simpan perubahan"
                  : "Simpan pengingat"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteReminderConfirmModal({
  item,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  item: ClassifiedReminder;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-rem-title">
        <div className="modal-head">
          <div>
            <span className="label">KONFIRMASI HAPUS</span>
            <h2 id="delete-rem-title">Hapus pengingat ini?</h2>
            <p>
              Pengingat <b>{item.title}</b> ({item.dateTimeLine}) akan dihapus permanen.
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
            {deleting ? "Menghapus..." : "Ya, hapus pengingat"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AgendaView({
  initialReminders,
  recommendation,
  initialError = null,
}: {
  initialReminders: Reminder[];
  recommendation: LabIntervalRecommendation;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<AgendaTab>("Akan Datang");
  const [modalState, setModalState] = useState<ModalMode>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<ClassifiedReminder | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isMutating, startMutation] = useTransition();

  const grouped = useMemo(() => groupAndCountReminders(reminders), [reminders]);

  const activeItems =
    filter === "Akan Datang"
      ? grouped.upcoming
      : filter === "Selesai"
        ? grouped.completed
        : grouped.overdue;

  const filterTabs: Array<{ label: AgendaTab; count: number }> = [
    { label: "Akan Datang", count: grouped.counts.upcoming },
    { label: "Selesai", count: grouped.counts.completed },
    { label: "Terlewat", count: grouped.counts.overdue },
  ];

  const openNewModal = (prefill?: ReminderFormValues) => {
    setModalState({
      open: true,
      editing: null,
      initialValues: prefill ?? {
        type: "control",
        title: "",
        remindAt: getTomorrowMorningWib(),
        location: "",
        notes: "",
      },
    });
  };

  const openEditModal = (item: ClassifiedReminder) => {
    setModalState({
      open: true,
      editing: item.raw,
      initialValues: {
        type: item.type,
        title: item.raw.title,
        remindAt: isoToWibDateTimeLocal(item.raw.remind_at),
        location: item.raw.location ?? "",
        notes: item.raw.notes ?? "",
      },
    });
  };

  const handleToggleDone = (item: ClassifiedReminder, nextDone: boolean) => {
    setActionError(null);
    setTogglingId(item.id);
    startMutation(async () => {
      const res = await toggleReminderDoneAction(item.id, nextDone);
      setTogglingId(null);
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === res.data.id ? res.data : r))
      );
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startMutation(async () => {
      const res = await deleteReminderAction(deleteTarget.id);
      if (!res.ok) {
        setDeleteError(res.error);
        return;
      }
      setReminders((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Agenda & Pengingat"
          subtitle="Jadwal kontrol, pemeriksaan lab, dan pengingat obat Anda."
        />
        <Button onClick={() => openNewModal()}>
          <Plus size={19} strokeWidth={1.8} /> Tambah pengingat
        </Button>
      </div>

      {initialError && (
        <Alert
          variant="critical"
          title="Gagal memuat agenda"
          description={initialError}
        >
          <button type="button" onClick={() => router.refresh()}>
            Muat ulang halaman
          </button>
        </Alert>
      )}

      {actionError && (
        <Alert variant="critical" title="Gagal memperbarui status" description={actionError} />
      )}

      <Card className="recommendation">
        <div className="recommend-icon">
          <Calendar size={22} strokeWidth={1.8} />
        </div>
        <div>
          <span className="label">SARAN INTERVAL LAB</span>
          <h3>{recommendation.headline}</h3>
          <p>{recommendation.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => openNewModal(recommendation.prefillValues)}
        >
          Buat Pengingat
        </Button>
      </Card>

      <div className="filter-tabs" role="tablist" aria-label="Filter status agenda">
        {filterTabs.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={filter === item.label}
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
        {activeItems.length === 0 ? (
          <Card className="empty-state">
            <Calendar size={24} strokeWidth={1.8} />
            {filter === "Akan Datang" && (
              <>
                <h3>Belum ada agenda akan datang</h3>
                <p className="empty-lab-desc">
                  Tambahkan jadwal kontrol dokter, pemeriksaan lab, atau pengingat obat agar
                  persiapan kontrol lebih teratur.
                </p>
                <Button onClick={() => openNewModal()}>
                  <Plus size={18} strokeWidth={1.8} /> Tambah pengingat
                </Button>
              </>
            )}
            {filter === "Selesai" && (
              <>
                <h3>Belum ada agenda yang ditandai selesai</h3>
                <p className="empty-lab-desc">
                  Setelah menjalani kontrol atau cek lab, tandai pengingat sebagai selesai untuk
                  mencatat riwayatnya.
                </p>
              </>
            )}
            {filter === "Terlewat" && (
              <>
                <h3>Tidak ada agenda terlewat</h3>
                <p>Bagus, semua agenda Anda tertangani.</p>
              </>
            )}
          </Card>
        ) : (
          activeItems.map((item) => {
            const busy = isMutating && togglingId === item.id;
            return (
              <Card className="schedule-card" key={item.id}>
                {item.bucket === "completed" ? (
                  <div className="date-block done">
                    <Check size={22} strokeWidth={1.8} />
                  </div>
                ) : item.bucket === "overdue" ? (
                  <div className="date-block overdue">
                    <AlertTriangle size={22} strokeWidth={1.8} />
                  </div>
                ) : (
                  <div
                    className={`date-block ${item.type === "lab" ? "blue" : ""}`}
                  >
                    <b>{item.day}</b>
                    <span>{item.month}</span>
                  </div>
                )}

                <div className="schedule-info">
                  <div className="schedule-badges">
                    <span
                      className={`status ${
                        item.bucket === "completed"
                          ? "completed"
                          : item.bucket === "overdue"
                            ? "overdue"
                            : item.type === "lab"
                              ? "planned"
                              : "upcoming"
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                    <span className="type-pill">{item.typeLabel}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.dateTimeLine}</p>
                  {item.notes && <small>{item.notes}</small>}
                </div>

                <div className="schedule-actions">
                  {item.bucket === "completed" ? (
                    <>
                      {item.type === "lab" && (
                        <Button href="/lab?catat=1">Catat Hasil Lab Sekarang</Button>
                      )}
                      <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={() => handleToggleDone(item, false)}
                      >
                        <RotateCcw size={15} strokeWidth={1.8} />
                        <span>{busy ? "Memproses..." : "Buka lagi"}</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => handleToggleDone(item, true)}
                    >
                      <Check size={16} strokeWidth={1.8} />
                      <span>{busy ? "Menyimpan..." : "Tandai selesai"}</span>
                    </Button>
                  )}

                  <div className="row-actions">
                    <button
                      type="button"
                      aria-label={`Edit pengingat ${item.title}`}
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil size={18} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus pengingat ${item.title}`}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(item);
                      }}
                    >
                      <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {modalState.open && (
        <ReminderFormModal
          editing={modalState.editing}
          initialValues={modalState.initialValues}
          onClose={() => setModalState({ open: false })}
          onSaved={(saved, mode) => {
            setReminders((prev) =>
              mode === "create"
                ? [saved, ...prev]
                : prev.map((r) => (r.id === saved.id ? saved : r))
            );
            setModalState({ open: false });
            router.refresh();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteReminderConfirmModal
          item={deleteTarget}
          deleting={isMutating}
          error={deleteError}
          onCancel={() => {
            if (!isMutating) setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
