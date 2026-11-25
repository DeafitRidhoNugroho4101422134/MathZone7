const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzh2IW_YTseWWk0xKk2L5w0RVtOlIfHxyjV54rvJuOkECMpSPDKidKTrdpztaY9H7O9/exec";

const latihanState = {
  factor: { n: 24 },
  fpb: { a: 12, b: 18, ans: 6 },
  kpk: { a: 12, b: 15, ans: 60 },
  trio: { a: 12, b: 18, c: 24, fpb: 6, kpk: 72 },
};

let soalTesAktif = [];

document.addEventListener("DOMContentLoaded", () => {
  const idSiswa = localStorage.getItem("mathzone_id");
  const studentBadge = document.getElementById("studentBadge");
  if (idSiswa) {
    studentBadge.textContent = `Halo, ${idSiswa}`;
  }

  tampilkanRiwayatNilaiLokal();

  // Inisialisasi angka acak untuk 4 latihan materi
  buatSoalLatihan("factor");
  buatSoalLatihan("fpb");
  buatSoalLatihan("kpk");
  buatSoalLatihan("trio");

  // Generate 15 soal tes kemampuan
  renderTesKemampuan();

  // Event submit & kerjakan ulang tes
  document
    .getElementById("quizForm")
    .addEventListener("submit", kirimJawabanTes);
  document.getElementById("retakeQuizBtn").addEventListener("click", () => {
    document.getElementById("quizResultPanel").hidden = true;
    document.getElementById("submitQuizBtn").hidden = false;
    document.getElementById("submitQuizBtn").disabled = false;
    document.getElementById("retakeQuizBtn").hidden = true;
    renderTesKemampuan();
    document
      .getElementById("tes-kemampuan")
      .scrollIntoView({ behavior: "smooth" });
  });
});

// =======================================================
// FUNGSI BANTU MATEMATIKA (FPB, KPK, FAKTORISASI PRIMA)
// =======================================================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pilihAcak(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hitungFPB(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function hitungKPK(a, b) {
  return Math.abs(a * b) / hitungFPB(a, b);
}

function hitungFPB3(a, b, c) {
  return hitungFPB(hitungFPB(a, b), c);
}

function hitungKPK3(a, b, c) {
  return hitungKPK(hitungKPK(a, b), c);
}

function isPrima(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function getFaktorPrimaMap(n) {
  const map = {};
  let temp = n;
  let d = 2;
  while (temp > 1) {
    while (temp % d === 0) {
      map[d] = (map[d] || 0) + 1;
      temp /= d;
    }
    d++;
  }
  return map;
}

function formatFaktorisasiHTML(n) {
  const map = getFaktorPrimaMap(n);
  return Object.keys(map)
    .map((p) => (map[p] > 1 ? `${p}<sup>${map[p]}</sup>` : `${p}`))
    .join(" &times; ");
}

function formatFaktorisasiTeks(n) {
  const map = getFaktorPrimaMap(n);
  const supMap = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
  return Object.keys(map)
    .map((p) => (map[p] > 1 ? `${p}${supMap[map[p]] || "^" + map[p]}` : `${p}`))
    .join(" × ");
}

// =======================================================
// BAGIAN 1: LATIHAN INTERAKTIF PER MATERI
// =======================================================
function buatSoalLatihan(tipe) {
  if (tipe === "factor") {
    const kandidat = [
      18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 72, 75, 80,
      84, 90, 96, 100, 108, 120,
    ];
    const n = pilihAcak(kandidat);
    latihanState.factor = { n };
    document.getElementById("factor-boxA").textContent = n;
    document.getElementById("factor-input").value = "";
  }

  if (tipe === "fpb") {
    const fpbTarget = pilihAcak([4, 6, 8, 9, 10, 12, 14, 15, 16, 18]);
    let m1 = randInt(2, 6);
    let m2 = randInt(2, 7);
    while (hitungFPB(m1, m2) !== 1 || m1 === m2) {
      m2 = randInt(2, 7);
    }
    const a = fpbTarget * m1;
    const b = fpbTarget * m2;
    latihanState.fpb = { a, b, ans: fpbTarget };
    document.getElementById("fpb-boxA").textContent = a;
    document.getElementById("fpb-boxB").textContent = b;
    document.getElementById("fpb-input").value = "";
  }

  if (tipe === "kpk") {
    const pasangan = [
      [6, 8],
      [8, 12],
      [9, 12],
      [10, 15],
      [12, 15],
      [12, 16],
      [12, 18],
      [14, 21],
      [15, 20],
      [16, 24],
      [18, 24],
      [20, 25],
      [24, 30],
    ];
    const [rawA, rawB] = pilihAcak(pasangan);
    const tukar = Math.random() > 0.5;
    const a = tukar ? rawB : rawA;
    const b = tukar ? rawA : rawB;
    const ans = hitungKPK(a, b);
    latihanState.kpk = { a, b, ans };
    document.getElementById("kpk-boxA").textContent = a;
    document.getElementById("kpk-boxB").textContent = b;
    document.getElementById("kpk-input").value = "";
  }

  if (tipe === "trio") {
    const trioSet = [
      [8, 12, 16],
      [10, 15, 20],
      [12, 18, 24],
      [12, 16, 24],
      [15, 20, 30],
      [16, 24, 32],
      [18, 24, 36],
      [20, 30, 40],
    ];
    const [a, b, c] = pilihAcak(trioSet);
    latihanState.trio = {
      a,
      b,
      c,
      fpb: hitungFPB3(a, b, c),
      kpk: hitungKPK3(a, b, c),
    };
    document.getElementById("trio-boxA").textContent = a;
    document.getElementById("trio-boxB").textContent = b;
    document.getElementById("trio-boxC").textContent = c;
    document.getElementById("trio-fpb-input").value = "";
    document.getElementById("trio-kpk-input").value = "";
  }

  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = true;
  fb.className = "feedback-box";
}

function cekFaktorisasiInput(rawStr, targetN) {
  // Normalisasi tanda kali (x, X, *, ×, ·) dan spasi
  const bersih = rawStr
    .toLowerCase()
    .replace(/[×*·]/g, "x")
    .replace(/\s+/g, "");

  if (!bersih) return { valid: false, alasan: "Jawaban masih kosong." };

  const suku = bersih.split("x");
  let hasilKali = 1;

  for (const item of suku) {
    const match = item.match(/^(\d+)(?:\^(\d+))?$/);
    if (!match) {
      return {
        valid: false,
        alasan:
          "Format penulisan belum sesuai. Gunakan tanda <code>x</code> untuk perkalian dan <code>^</code> untuk pangkat (contoh: <code>2^3 x 3</code>).",
      };
    }

    const basis = Number(match[1]);
    const pangkat = match[2] ? Number(match[2]) : 1;

    if (!isPrima(basis)) {
      return {
        valid: false,
        alasan: `Angka <strong>${basis}</strong> bukan bilangan prima, sehingga masih bisa dipecah lagi menjadi perkalian bilangan prima.`,
      };
    }

    if (pangkat < 1) {
      return { valid: false, alasan: "Pangkat harus bernilai positif." };
    }

    hasilKali *= Math.pow(basis, pangkat);
  }

  if (hasilKali !== targetN) {
    return {
      valid: false,
      alasan: `Hasil perkalian yang kamu tulis bernilai <strong>${hasilKali}</strong>, belum sama dengan <strong>${targetN}</strong>.`,
    };
  }

  return { valid: true };
}

function cekLatihan(tipe) {
  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = false;

  if (tipe === "factor") {
    const val = document.getElementById("factor-input").value.trim();
    const { n } = latihanState.factor;
    const cek = cekFaktorisasiInput(val, n);

    if (cek.valid) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Hebat! Jawabanmu Benar!</strong><br>Faktorisasi prima dari <strong>${n}</strong> adalah <strong>${formatFaktorisasiHTML(n)}</strong>. Klik <em>"Coba Lagi"</em> untuk angka baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat!</strong> ${cek.alasan}<br><strong>Penjelasan:</strong> Bentuk faktorisasi prima dari <strong>${n}</strong> yang tepat adalah <strong>${formatFaktorisasiHTML(n)}</strong>.`;
    }
    return;
  }

  if (tipe === "fpb") {
    const val = document.getElementById("fpb-input").value.trim();
    if (val === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan angka jawabanmu terlebih dahulu.";
      return;
    }
    const { a, b, ans } = latihanState.fpb;
    const userAns = Number(val);

    if (userAns === ans) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Benar! FPB dari ${a} dan ${b} adalah ${ans}.</strong><br>Klik <em>"Coba Lagi"</em> untuk berlatih dengan angka berbeda.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}, seharusnya ${ans}.</strong><br>
        <strong>Penjelasan:</strong><br>
        &bull; ${a} = ${formatFaktorisasiHTML(a)}<br>
        &bull; ${b} = ${formatFaktorisasiHTML(b)}<br>
        Pilih faktor prima yang <strong>sama</strong> dengan pangkat <strong>terkecil</strong>, sehingga FPB = <strong>${ans}</strong>.`;
    }
    return;
  }

  if (tipe === "kpk") {
    const val = document.getElementById("kpk-input").value.trim();
    if (val === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan angka jawabanmu terlebih dahulu.";
      return;
    }
    const { a, b, ans } = latihanState.kpk;
    const userAns = Number(val);

    if (userAns === ans) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Benar! KPK dari ${a} dan ${b} adalah ${ans}.</strong><br>Klik <em>"Coba Lagi"</em> untuk berlatih dengan angka berbeda.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}, seharusnya ${ans}.</strong><br>
        <strong>Penjelasan:</strong><br>
        &bull; ${a} = ${formatFaktorisasiHTML(a)}<br>
        &bull; ${b} = ${formatFaktorisasiHTML(b)}<br>
        Kalikan <strong>semua</strong> faktor prima dengan pangkat <strong>terbesar</strong>, sehingga KPK = <strong>${ans}</strong>.`;
    }
    return;
  }

  if (tipe === "trio") {
    const valFpb = document.getElementById("trio-fpb-input").value.trim();
    const valKpk = document.getElementById("trio-kpk-input").value.trim();

    if (valFpb === "" || valKpk === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Lengkapi kolom jawaban <strong>FPB</strong> dan <strong>KPK</strong> terlebih dahulu.";
      return;
    }

    const { a, b, c, fpb, kpk } = latihanState.trio;
    const userFpb = Number(valFpb);
    const userKpk = Number(valKpk);

    if (userFpb === fpb && userKpk === kpk) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Sempurna! FPB = ${fpb} dan KPK = ${kpk}.</strong><br>Klik <em>"Coba Lagi"</em> untuk mencoba 3 bilangan baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Belum tepat!</strong> Jawabanmu (FPB = ${userFpb}, KPK = ${userKpk}), seharusnya <strong>FPB = ${fpb}</strong> dan <strong>KPK = ${kpk}</strong>.<br>
        <strong>Penjelasan:</strong><br>
        &bull; ${a} = ${formatFaktorisasiHTML(a)}<br>
        &bull; ${b} = ${formatFaktorisasiHTML(b)}<br>
        &bull; ${c} = ${formatFaktorisasiHTML(c)}`;
    }
  }
}

// =======================================================
// BAGIAN 2: GENERATOR 15 SOAL TES KEMAMPUAN (ABCD)
// =======================================================
function buatOpsiAngka(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const val of kandidatSalah) {
    if (setOpsi.size < 4 && Number.isFinite(val) && val > 0) {
      setOpsi.add(val);
    }
  }
  let tambah = 2;
  while (setOpsi.size < 4) {
    setOpsi.add(jawabanBenar + tambah);
    if (setOpsi.size < 4 && jawabanBenar - tambah > 0) {
      setOpsi.add(jawabanBenar - tambah);
    }
    tambah += 2;
  }
  return Array.from(setOpsi).sort(() => Math.random() - 0.5);
}

function generate15Soal() {
  const bankSoal = [];

  // 1. Faktorisasi prima dari suatu bilangan
  {
    const angka = pilihAcak([36, 48, 54, 60, 72, 84, 90, 96, 108, 120]);
    const benar = formatFaktorisasiTeks(angka);
    const pengecoh = [
      formatFaktorisasiTeks(angka / 2),
      formatFaktorisasiTeks(angka * 2),
      "2² × 3 × 7",
      "2³ × 3 × 5",
      "2 × 3² × 5",
    ].filter((s) => s !== benar);

    const opsi = [benar, ...pengecoh.slice(0, 3)].sort(
      () => Math.random() - 0.5,
    );
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Bentuk faktorisasi prima dari bilangan ${angka} adalah ....`,
      jawaban: benar,
      opsi,
      bahas: `${angka} = ${benar}.`,
    });
  }

  // 2. Faktor-faktor prima dari suatu bilangan
  {
    const setKandidat = [
      {
        n: 42,
        benar: "2, 3, dan 7",
        salah: ["2, 3, dan 5", "2, 6, dan 7", "1, 2, 3, dan 7"],
      },
      {
        n: 60,
        benar: "2, 3, dan 5",
        salah: ["2, 3, 4, dan 5", "2, 5, dan 6", "3, 4, dan 5"],
      },
      {
        n: 70,
        benar: "2, 5, dan 7",
        salah: ["2, 5, dan 10", "2, 7, dan 14", "5, 7, dan 10"],
      },
      {
        n: 84,
        benar: "2, 3, dan 7",
        salah: ["2, 4, dan 7", "2, 3, dan 14", "3, 4, dan 7"],
      },
      {
        n: 90,
        benar: "2, 3, dan 5",
        salah: ["2, 5, dan 9", "3, 5, dan 6", "2, 3, dan 15"],
      },
    ];
    const item = pilihAcak(setKandidat);
    const opsi = [item.benar, ...item.salah].sort(() => Math.random() - 0.5);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Faktor-faktor prima dari ${item.n} adalah ....`,
      jawaban: item.benar,
      opsi,
      bahas: `Faktorisasi prima ${item.n} = ${formatFaktorisasiTeks(item.n)}, sehingga faktor primanya adalah ${item.benar}.`,
    });
  }

  // 3. FPB 2 bilangan
  {
    const fpb = pilihAcak([6, 8, 9, 12, 14, 15, 16, 18]);
    const a = fpb * 2;
    const b = fpb * 3;
    const kpk = hitungKPK(a, b);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `FPB dari ${a} dan ${b} adalah ....`,
      jawaban: String(fpb),
      opsi: buatOpsiAngka(fpb, [kpk, fpb / 2, fpb + 4]).map(String),
      bahas: `${a} = ${formatFaktorisasiTeks(a)} dan ${b} = ${formatFaktorisasiTeks(b)}. Faktor prima sama pangkat terkecil menghasilkan FPB = ${fpb}.`,
    });
  }

  // 4. KPK 2 bilangan
  {
    const [a, b] = pilihAcak([
      [12, 16],
      [14, 21],
      [15, 25],
      [16, 20],
      [18, 24],
      [20, 30],
    ]);
    const kpk = hitungKPK(a, b);
    const fpb = hitungFPB(a, b);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `KPK dari ${a} dan ${b} adalah ....`,
      jawaban: String(kpk),
      opsi: buatOpsiAngka(kpk, [fpb, a * b, kpk / 2]).map(String),
      bahas: `${a} = ${formatFaktorisasiTeks(a)} dan ${b} = ${formatFaktorisasiTeks(b)}. Semua faktor prima pangkat terbesar menghasilkan KPK = ${kpk}.`,
    });
  }

  // 5. FPB 3 bilangan
  {
    const [a, b, c] = pilihAcak([
      [12, 18, 30],
      [16, 24, 40],
      [18, 27, 45],
      [20, 30, 50],
      [24, 36, 48],
    ]);
    const fpb = hitungFPB3(a, b, c);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `FPB dari ${a}, ${b}, dan ${c} adalah ....`,
      jawaban: String(fpb),
      opsi: buatOpsiAngka(fpb, [fpb * 2, fpb / 2, fpb + 3]).map(String),
      bahas: `Faktor prima yang sama pada ketiga bilangan (${a}, ${b}, ${c}) dengan pangkat terkecil adalah ${fpb}.`,
    });
  }

  // 6. KPK 3 bilangan
  {
    const [a, b, c] = pilihAcak([
      [6, 8, 12],
      [8, 10, 12],
      [9, 12, 18],
      [10, 12, 15],
      [12, 15, 20],
    ]);
    const kpk = hitungKPK3(a, b, c);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `KPK dari ${a}, ${b}, dan ${c} adalah ....`,
      jawaban: String(kpk),
      opsi: buatOpsiAngka(kpk, [kpk / 2, kpk * 2, hitungFPB3(a, b, c)]).map(
        String,
      ),
      bahas: `Kelipatan persekutuan terkecil dari ${a}, ${b}, dan ${c} adalah ${kpk}.`,
    });
  }

  // 7. FPB dari bentuk faktorisasi prima
  {
    const setFaktor = [
      {
        tanya:
          "Diketahui P = 2³ × 3² × 5 dan Q = 2² × 3³ × 7. Nilai FPB dari P dan Q adalah ....",
        ans: 36,
        bahas:
          "Faktor prima yang sama adalah 2 dan 3. Ambil pangkat terkecil: 2² × 3² = 4 × 9 = 36.",
      },
      {
        tanya:
          "Diketahui A = 2² × 3 × 5² dan B = 2³ × 3² × 5. Nilai FPB dari A dan B adalah ....",
        ans: 60,
        bahas:
          "Faktor prima yang sama adalah 2, 3, dan 5. Ambil pangkat terkecil: 2² × 3 × 5 = 4 × 3 × 5 = 60.",
      },
      {
        tanya:
          "Diketahui M = 2⁴ × 3² dan N = 2² × 3³ × 5. Nilai FPB dari M dan N adalah ....",
        ans: 36,
        bahas:
          "Faktor prima yang sama adalah 2 dan 3. Ambil pangkat terkecil: 2² × 3² = 4 × 9 = 36.",
      },
    ];
    const soal = pilihAcak(setFaktor);
    bankSoal.push({
      tipe: "Konsep Faktorisasi",
      tanya: soal.tanya,
      jawaban: String(soal.ans),
      opsi: buatOpsiAngka(soal.ans, [
        soal.ans * 2,
        soal.ans / 2,
        soal.ans + 12,
      ]).map(String),
      bahas: soal.bahas,
    });
  }

  // 8. KPK dari bentuk faktorisasi prima
  {
    const setKpkFaktor = [
      {
        tanya:
          "Diketahui X = 2² × 3 dan Y = 2 × 3² × 5. Nilai KPK dari X dan Y adalah ....",
        ans: 180,
        bahas:
          "Ambil semua faktor prima pangkat terbesar: 2² × 3² × 5 = 4 × 9 × 5 = 180.",
      },
      {
        tanya:
          "Diketahui K = 2³ × 5 dan L = 2² × 3 × 5. Nilai KPK dari K dan L adalah ....",
        ans: 120,
        bahas:
          "Ambil semua faktor prima pangkat terbesar: 2³ × 3 × 5 = 8 × 3 × 5 = 120.",
      },
      {
        tanya:
          "Diketahui R = 2 × 3² dan S = 2² × 3 × 7. Nilai KPK dari R dan S adalah ....",
        ans: 252,
        bahas:
          "Ambil semua faktor prima pangkat terbesar: 2² × 3² × 7 = 4 × 9 × 7 = 252.",
      },
    ];
    const soal = pilihAcak(setKpkFaktor);
    bankSoal.push({
      tipe: "Konsep Faktorisasi",
      tanya: soal.tanya,
      jawaban: String(soal.ans),
      opsi: buatOpsiAngka(soal.ans, [soal.ans / 2, soal.ans + 30, 6]).map(
        String,
      ),
      bahas: soal.bahas,
    });
  }

  // 9. Soal Cerita 1 (KPK - Lampu Hias Berkedip)
  {
    const [d1, d2, d3] = pilihAcak([
      [4, 6, 8],
      [6, 8, 12],
      [5, 10, 15],
      [6, 9, 12],
    ]);
    const ans = hitungKPK3(d1, d2, d3);
    bankSoal.push({
      tipe: "Soal Cerita (KPK)",
      tanya: `Tiga buah lampu hias masing-masing berkedip setiap ${d1} detik, ${d2} detik, dan ${d3} detik. Jika ketiga lampu berkedip bersamaan pada pukul 19.00, ketiga lampu akan berkedip bersamaan lagi setelah .... detik.`,
      jawaban: String(ans),
      opsi: buatOpsiAngka(ans, [
        d1 + d2 + d3,
        hitungFPB3(d1, d2, d3),
        ans * 2,
      ]).map(String),
      bahas: `Gunakan KPK dari ${d1}, ${d2}, dan ${d3} = ${ans} detik.`,
    });
  }

  // 10. Soal Cerita 2 (KPK - Jadwal Latihan / Tanggal Bertemu)
  {
    const [h1, h2] = pilihAcak([
      [4, 6],
      [6, 8],
      [5, 6],
      [4, 7],
      [6, 9],
    ]);
    const tglAwal = randInt(1, 8);
    const kpk = hitungKPK(h1, h2);
    const ans = tglAwal + kpk;
    bankSoal.push({
      tipe: "Soal Cerita (KPK)",
      tanya: `Andi berlatih futsal setiap ${h1} hari sekali, sedangkan Bagas berlatih di tempat yang sama setiap ${h2} hari sekali. Jika mereka berlatih bersama pada tanggal ${tglAwal} Mei, pada tanggal berapa mereka akan berlatih bersama lagi? (Mei)`,
      jawaban: String(ans),
      opsi: buatOpsiAngka(ans, [tglAwal + h1 + h2, kpk, ans + 2]).map(String),
      bahas: `KPK dari ${h1} dan ${h2} = ${kpk} hari. Mereka bertemu lagi tanggal ${tglAwal} + ${kpk} = ${ans} Mei.`,
    });
  }

  // 11. Soal Cerita 3 (KPK - Membeli Kemasan Roti & Susu)
  {
    const [isiRoti, isiSusu] = pilihAcak([
      [8, 12],
      [10, 15],
      [12, 16],
      [15, 20],
    ]);
    const kpk = hitungKPK(isiRoti, isiSusu);
    const bungkusRoti = kpk / isiRoti;
    bankSoal.push({
      tipe: "Soal Cerita (KPK)",
      tanya: `Ibu membeli roti yang berisi ${isiRoti} buah per bungkus dan susu kotak yang berisi ${isiSusu} kotak per dus. Ibu ingin membeli roti dan susu dalam jumlah yang sama banyak. Paling sedikit berapa bungkus roti yang harus dibeli Ibu?`,
      jawaban: String(bungkusRoti),
      opsi: buatOpsiAngka(bungkusRoti, [
        kpk / isiSusu,
        kpk,
        bungkusRoti + 2,
      ]).map(String),
      bahas: `KPK dari ${isiRoti} dan ${isiSusu} = ${kpk} buah. Banyak bungkus roti = ${kpk} ÷ ${isiRoti} = ${bungkusRoti} bungkus.`,
    });
  }

  // 12. Soal Cerita 4 (FPB - Jumlah Paket / Kantong Maksimal)
  {
    const fpb = pilihAcak([8, 10, 12, 14, 15, 16]);
    const jeruk = fpb * 3;
    const apel = fpb * 4;
    bankSoal.push({
      tipe: "Soal Cerita (FPB)",
      tanya: `Bu Sari memiliki ${jeruk} buah jeruk dan ${apel} buah apel. Buah-buahan tersebut akan dimasukkan ke dalam beberapa keranjang dengan jumlah dan jenis yang sama banyak. Jumlah keranjang terbanyak yang dibutuhkan adalah ....`,
      jawaban: String(fpb),
      opsi: buatOpsiAngka(fpb, [3, 4, fpb * 2]).map(String),
      bahas: `Gunakan FPB dari ${jeruk} dan ${apel} = ${fpb} keranjang.`,
    });
  }

  // 13. Soal Cerita 5 (FPB - Jumlah Barang di Setiap Paket)
  {
    const fpb = pilihAcak([6, 8, 9, 10, 12]);
    const bukuPerPaket = randInt(4, 6);
    const pensilPerPaket = randInt(2, 3);
    const totalBuku = fpb * bukuPerPaket;
    const totalPensil = fpb * pensilPerPaket;
    bankSoal.push({
      tipe: "Soal Cerita (FPB)",
      tanya: `Panitia bakti sosial menyiapkan ${totalBuku} buku tulis dan ${totalPensil} pensil untuk dibagikan dalam bentuk paket alat tulis dengan isi sama banyak. Banyak buku tulis dalam setiap paket adalah ....`,
      jawaban: String(bukuPerPaket),
      opsi: buatOpsiAngka(bukuPerPaket, [
        fpb,
        pensilPerPaket,
        bukuPerPaket + 2,
      ]).map(String),
      bahas: `Banyak paket maksimal = FPB(${totalBuku}, ${totalPensil}) = ${fpb} paket. Banyak buku tiap paket = ${totalBuku} ÷ ${fpb} = ${bukuPerPaket} buku.`,
    });
  }

  // 14. Soal Cerita 6 (FPB - Memotong Tali / Pita)
  {
    const fpb = pilihAcak([7, 9, 12, 15, 18]);
    const tali1 = fpb * 3;
    const tali2 = fpb * 5;
    bankSoal.push({
      tipe: "Soal Cerita (FPB)",
      tanya: `Pak Budi memiliki dua gulung tali dengan panjang masing-masing ${tali1} cm dan ${tali2} cm. Kedua tali akan dipotong menjadi beberapa bagian sama panjang dan terpanjang. Panjang setiap potongan tali adalah .... cm.`,
      jawaban: String(fpb),
      opsi: buatOpsiAngka(fpb, [8, fpb * 2, fpb - 3]).map(String),
      bahas: `Panjang potongan terpanjang = FPB dari ${tali1} dan ${tali2} = ${fpb} cm.`,
    });
  }

  // 15. Soal Cerita 7 (FPB - Barisan Siswa)
  {
    const fpb = pilihAcak([8, 10, 12, 14, 16]);
    const putra = fpb * 3;
    const putri = fpb * 4;
    bankSoal.push({
      tipe: "Soal Cerita (FPB)",
      tanya: `Dalam kegiatan pramuka terdapat ${putra} siswa putra dan ${putri} siswa putri. Pembina akan membentuk beberapa barisan dengan jumlah siswa putra dan putri sama banyak di setiap baris. Jumlah barisan terbanyak yang dapat dibentuk adalah ....`,
      jawaban: String(fpb),
      opsi: buatOpsiAngka(fpb, [7, fpb / 2, fpb + 4]).map(String),
      bahas: `Jumlah barisan terbanyak = FPB dari ${putra} dan ${putri} = ${fpb} barisan.`,
    });
  }

  return bankSoal;
}

function renderTesKemampuan() {
  soalTesAktif = generate15Soal();
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  const hurufOpsi = ["A", "B", "C", "D"];

  soalTesAktif.forEach((soal, index) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${index}`;

    const optionsHTML = soal.opsi
      .map(
        (teksOpsi, idxOpsi) => `
        <label class="option-label" id="opt-label-${index}-${idxOpsi}">
          <input type="radio" name="soal_${index}" value="${teksOpsi}" />
          <span><strong>${hurufOpsi[idxOpsi]}.</strong> ${teksOpsi}</span>
        </label>
      `,
      )
      .join("");

    card.innerHTML = `
      <span class="q-badge">Soal ${index + 1} &bull; ${soal.tipe}</span>
      <p class="q-text">${soal.tanya}</p>
      <div class="options-grid">${optionsHTML}</div>
      <div class="q-explanation" id="q-exp-${index}" hidden></div>
    `;

    container.appendChild(card);
  });
}

// =======================================================
// BAGIAN 3: PENILAIAN & PENGIRIMAN KE GOOGLE SPREADSHEET
// =======================================================
async function kirimJawabanTes(e) {
  e.preventDefault();

  let jumlahBenar = 0;
  let pertamaBelumDijawab = null;

  soalTesAktif.forEach((_, idx) => {
    const card = document.getElementById(`q-card-${idx}`);
    card.classList.remove("unanswered");
    const terpilih = document.querySelector(
      `input[name="soal_${idx}"]:checked`,
    );
    if (!terpilih) {
      card.classList.add("unanswered");
      if (!pertamaBelumDijawab) pertamaBelumDijawab = card;
    }
  });

  if (pertamaBelumDijawab) {
    alert(
      "Masih ada soal yang belum dijawab! Silakan lengkapi semua 15 soal terlebih dahulu.",
    );
    pertamaBelumDijawab.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  soalTesAktif.forEach((soal, idx) => {
    const radios = document.querySelectorAll(`input[name="soal_${idx}"]`);
    const terpilih = document.querySelector(
      `input[name="soal_${idx}"]:checked`,
    );
    const jawabanUser = terpilih.value;
    const isBenar = jawabanUser === soal.jawaban;

    if (isBenar) jumlahBenar++;

    radios.forEach((radio, optIdx) => {
      radio.disabled = true;
      const label = document.getElementById(`opt-label-${idx}-${optIdx}`);

      if (radio.value === soal.jawaban) {
        label.classList.add("correct-choice");
      } else if (radio.checked && !isBenar) {
        label.classList.add("wrong-choice");
      }
    });

    const expBox = document.getElementById(`q-exp-${idx}`);
    expBox.hidden = false;
    expBox.innerHTML = isBenar
      ? `<strong>&#9989; Benar!</strong> ${soal.bahas}`
      : `<strong>&#10060; Kurang tepat (Jawaban benar: ${soal.jawaban}).</strong> ${soal.bahas}`;
  });

  const skorAkhir = Math.round((jumlahBenar / soalTesAktif.length) * 100);

  const submitBtn = document.getElementById("submitQuizBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "MENYIMPAN NILAI...";

  const resultPanel = document.getElementById("quizResultPanel");
  resultPanel.hidden = false;
  resultPanel.innerHTML = `
    <p>Jawaban Benar: <strong>${jumlahBenar} dari ${soalTesAktif.length} soal</strong></p>
    <div class="result-score">Nilai: ${skorAkhir}</div>
    <p class="sync-status" id="syncStatusText">Mengirim nilai ke Google Spreadsheet...</p>
  `;
  resultPanel.scrollIntoView({ behavior: "smooth" });

  await simpanNilaiKeSpreadsheet(skorAkhir);

  submitBtn.hidden = true;
  submitBtn.textContent = "KIRIM JAWABAN";
  document.getElementById("retakeQuizBtn").hidden = false;
}

async function simpanNilaiKeSpreadsheet(skorBaru) {
  const syncText = document.getElementById("syncStatusText");
  const idSiswa = localStorage.getItem("mathzone_id");

  if (!idSiswa) {
    syncText.textContent =
      "Sesi login tidak ditemukan (mode tamu). Silakan login dari halaman awal agar nilai tercatat di Spreadsheet.";
    return;
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "simpan_nilai",
        id: idSiswa,
        materi: "KPK_FPB",
        skor: skorBaru,
      }),
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      const rekapNilai = JSON.parse(
        localStorage.getItem("mathzone_nilai") || "{}",
      );
      rekapNilai.KPK_FPB = hasil.riwayat_string || skorBaru;
      localStorage.setItem("mathzone_nilai", JSON.stringify(rekapNilai));

      tampilkanRiwayatNilaiLokal();
      syncText.style.color = "#135e29";
      syncText.textContent = `Tersimpan! Riwayat 3 percobaan terakhir di Spreadsheet: [${hasil.riwayat_string}]`;
    } else {
      syncText.style.color = "#c5221f";
      syncText.textContent =
        hasil.message || "Gagal menyimpan nilai ke Spreadsheet.";
    }
  } catch (err) {
    console.error("Gagal kirim nilai:", err);
    syncText.style.color = "#c5221f";
    syncText.textContent =
      "Gagal terhubung ke Spreadsheet. Periksa koneksi internetmu.";
  }
}

function tampilkanRiwayatNilaiLokal() {
  const pill = document.getElementById("attemptHistoryPill");
  const rekapNilai = JSON.parse(localStorage.getItem("mathzone_nilai") || "{}");
  const nilaiKpkFpb = rekapNilai.KPK_FPB;

  if (nilaiKpkFpb !== null && nilaiKpkFpb !== undefined && nilaiKpkFpb !== "") {
    pill.textContent = `Riwayat Nilai (Maks. 3 Percobaan): ${nilaiKpkFpb}`;
  } else {
    pill.textContent = "Riwayat Nilai: Belum ada";
  }
}
