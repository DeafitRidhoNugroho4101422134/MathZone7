document.addEventListener("DOMContentLoaded", () => {
  const studentBadge = document.getElementById("studentBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const menuButtons = document.querySelectorAll(".menu-btn");

  // 1. Tampilkan ID siswa yang sedang login dari localStorage
  const idSiswa = localStorage.getItem("mathzone_id");
  if (idSiswa) {
    studentBadge.textContent = `Halo, ${idSiswa}`;
  }

  // 2. Tampilkan nilai masing-masing materi jika sudah tersimpan dari Spreadsheet
  const savedNilaiRaw = localStorage.getItem("mathzone_nilai");
  if (savedNilaiRaw) {
    try {
      const rekapNilai = JSON.parse(savedNilaiRaw);
      menuButtons.forEach((btn) => {
        const kodeMateri = btn.getAttribute("data-materi");
        const nilaiMateri = rekapNilai[kodeMateri];
        const scoreTag = btn.querySelector(".score-tag");

        if (
          nilaiMateri !== null &&
          nilaiMateri !== undefined &&
          nilaiMateri !== ""
        ) {
          scoreTag.textContent = `Nilai: ${nilaiMateri}`;
          scoreTag.hidden = false;
        }
      });
    } catch (e) {
      console.warn("Gagal membaca data nilai:", e);
    }
  }

  // 3. Animasi feedback saat salah satu materi diklik sebelum berpindah halaman
  menuButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetUrl = btn.getAttribute("href");
      btn.classList.add("clicked");

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    });
  });

  // 4. Tombol Keluar (Kembali ke index.html)
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("mathzone_id");
    localStorage.removeItem("mathzone_nilai");
    window.location.href = "index.html";
  });
});
