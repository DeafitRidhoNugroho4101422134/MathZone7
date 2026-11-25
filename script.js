// URL WEB APP GOOGLE APPS SCRIPT SUDAH TERPASANG DI SINI:
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzh2IW_YTseWWk0xKk2L5w0RVtOlIfHxyjV54rvJuOkECMpSPDKidKTrdpztaY9H7O9/exec";

const loginForm = document.getElementById("loginForm");
const userNameInput = document.getElementById("userName");
const userPasswordInput = document.getElementById("userPassword");
const startBtn = document.getElementById("startBtn");
const btnText = document.getElementById("btnText");
const statusMessage = document.getElementById("statusMessage");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const idPengguna = userNameInput.value.trim();
  const password = userPasswordInput.value.trim();

  statusMessage.textContent = "";
  statusMessage.classList.remove("error");

  if (!idPengguna || !password) {
    tampilkanError("ID Pengguna dan Password wajib diisi!");
    return;
  }

  if (!SCRIPT_URL || SCRIPT_URL === "PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI") {
    tampilkanError("URL Google Apps Script belum dipasang di script.js!");
    return;
  }

  setLoading(true);
  statusMessage.textContent = "Memeriksa ID siswa...";

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "login",
        id: idPengguna,
        pass: password,
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      statusMessage.textContent = "Berhasil! Membuka Menu Utama...";

      // Simpan ID dan riwayat nilai siswa agar bisa ditampilkan di menu_utama.html
      localStorage.setItem("mathzone_id", result.id);
      localStorage.setItem("mathzone_nilai", JSON.stringify(result.nilai));

      setTimeout(() => {
        window.location.href = "menu_utama.html";
      }, 600);
    } else {
      tampilkanError(result.message || "ID atau Password salah!");
      setLoading(false);
    }
  } catch (error) {
    console.error("Error:", error);
    tampilkanError("Gagal terhubung ke server. Periksa koneksi internet.");
    setLoading(false);
  }
});

function setLoading(isLoading) {
  startBtn.disabled = isLoading;
  btnText.textContent = isLoading ? "LOADING..." : "START";
}

function tampilkanError(pesan) {
  statusMessage.textContent = pesan;
  statusMessage.classList.add("error");
}
