export const DELETE_CONFIRMATION_PHRASE = "HAPUS AKUN SAYA";

export interface DeleteAccountInput {
  phrase: string;
  acknowledged: boolean;
}

export interface DeleteAccountValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDeleteAccountInput(
  input: DeleteAccountInput,
): DeleteAccountValidationResult {
  if (input.phrase.trim() !== DELETE_CONFIRMATION_PHRASE) {
    return {
      valid: false,
      error: `Ketik frasa persetujuan persis "${DELETE_CONFIRMATION_PHRASE}" untuk melanjutkan.`,
    };
  }

  if (!input.acknowledged) {
    return {
      valid: false,
      error:
        "Centang persetujuan bahwa seluruh data kesehatan Anda akan dihapus permanen.",
    };
  }

  return { valid: true };
}
