/**
 * Menerjemahkan pesan error teknis dari Supabase Auth menjadi pesan Bahasa
 * Indonesia yang ramah dan mudah dipahami pasien.
 */
export function translateSupabaseAuthError(rawMessage: string): string {
  const msg = rawMessage.toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Email atau kata sandi salah. Periksa kembali dan coba lagi.";
  }
  if (msg.includes("email not confirmed")) {
    return "Email Anda belum dikonfirmasi. Cek kotak masuk atau folder spam Anda.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
  }
  if (msg.includes("password should be at least")) {
    return "Kata sandi minimal 6 karakter.";
  }
  if (msg.includes("unable to validate email address") || msg.includes("invalid email")) {
    return "Format alamat email tidak valid.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (msg.includes("for security purposes, you can only request this after")) {
    return "Mohon tunggu beberapa detik sebelum mengirim permintaan lagi.";
  }
  if (msg.includes("signup is disabled")) {
    return "Pendaftaran akun baru sedang dinonaktifkan sementara.";
  }
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return "Gagal terhubung ke server. Periksa koneksi internet Anda.";
  }

  return "Terjadi kendala saat memproses akun Anda. Silakan coba beberapa saat lagi.";
}
