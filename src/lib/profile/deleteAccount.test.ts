import { describe, expect, it } from "vitest";
import { isValidServiceRoleKey } from "@/lib/supabase/admin";
import {
  DELETE_CONFIRMATION_PHRASE,
  validateDeleteAccountInput,
} from "./deleteAccount";

describe("validateDeleteAccountInput", () => {
  it("lolos bila frasa tepat dan checkbox disetujui", () => {
    expect(
      validateDeleteAccountInput({
        phrase: DELETE_CONFIRMATION_PHRASE,
        acknowledged: true,
      }),
    ).toEqual({ valid: true });

    expect(
      validateDeleteAccountInput({
        phrase: "  HAPUS AKUN SAYA  ",
        acknowledged: true,
      }),
    ).toEqual({ valid: true });
  });

  it("menolak bila frasa salah atau case tidak cocok", () => {
    const res = validateDeleteAccountInput({
      phrase: "hapus akun saya",
      acknowledged: true,
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain(DELETE_CONFIRMATION_PHRASE);
  });

  it("menolak bila checkbox konfirmasi belum dicentang", () => {
    const res = validateDeleteAccountInput({
      phrase: DELETE_CONFIRMATION_PHRASE,
      acknowledged: false,
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Centang persetujuan");
  });
});

describe("isValidServiceRoleKey", () => {
  it("menolak key kosong atau placeholder dan menerima key terisi", () => {
    expect(isValidServiceRoleKey(undefined)).toBe(false);
    expect(isValidServiceRoleKey("   ")).toBe(false);
    expect(isValidServiceRoleKey("YOUR_SERVICE_ROLE_KEY")).toBe(false);
    expect(isValidServiceRoleKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx")).toBe(
      true,
    );
  });
});
