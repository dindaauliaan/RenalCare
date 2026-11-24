/**
 * Error untuk input klinis yang tidak valid (misalnya usia di bawah 18 tahun,
 * kreatinin nol/negatif, atau satuan yang tidak dikenal).
 *
 * Kelas tersendiri dipakai agar UI nanti bisa membedakan "input salah dari
 * pengguna" (tampilkan pesan ramah) dari bug program (error lain).
 */
export class ClinicalInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClinicalInputError";
  }
}

/** Memastikan nilai adalah angka berhingga (bukan NaN / Infinity). */
export function assertFiniteNumber(value: unknown, fieldLabel: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ClinicalInputError(`${fieldLabel} harus berupa angka yang valid.`);
  }
}

/** Memastikan nilai adalah angka berhingga dan lebih besar dari nol. */
export function assertPositiveNumber(value: unknown, fieldLabel: string): asserts value is number {
  assertFiniteNumber(value, fieldLabel);
  if (value <= 0) {
    throw new ClinicalInputError(`${fieldLabel} harus lebih besar dari 0.`);
  }
}

/** Memastikan nilai adalah angka berhingga dan tidak negatif (boleh 0). */
export function assertNonNegativeNumber(value: unknown, fieldLabel: string): asserts value is number {
  assertFiniteNumber(value, fieldLabel);
  if (value < 0) {
    throw new ClinicalInputError(`${fieldLabel} tidak boleh negatif.`);
  }
}
