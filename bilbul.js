const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzh2IW_YTseWWk0xKk2L5w0RVtOlIfHxyjV54rvJuOkECMpSPDKidKTrdpztaY9H7O9/exec";

// State untuk 4 kotak latihan interaktif
const latihanState = {
  add: { a: 0, b: 0, ans: 0 },
  sub: { a: 0, b: 0, ans: 0 },
  mul: { a: 0, b: 0, ans: 0 },
  div: { a: 0, b: 0, ans: 0 },
};

let soalTesAktif = [];

document.addEventListener("DOMContentLoaded", () => {
  // Tampilkan ID siswa dari localStorage
  const idSiswa = localStorage.getItem("mathzone_id");
  const studentBadge = document.getElementById("studentBadge");
  if (idSiswa) {
    studentBadge.textContent = `Halo, ${idSiswa}`;
  }

  tampilkanRiwayatNilaiLokal();

  // Inisialisasi angka acak untuk ke-4 latihan materi
  buatSoalLatihan("add");
  buatSoalLatihan("sub");
  buatSoalLatihan("mul");
  buatSoalLatihan("div");

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
// BAGIAN 1: LATIHAN INTERAKTIF PER MATERI
// =======================================================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randNonZero(min, max) {
  let n = 0;
  while (n === 0) {
    n = randInt(min, max);
  }
  return n;
}

function formatKurung(n) {
  return n < 0 ? `(${n})` : `${n}`;
}

function buatSoalLatihan(op) {
  let a, b, ans;

  if (op === "add") {
    a = randNonZero(-20, 20);
    b = randNonZero(-20, 20);
    ans = a + b;
  } else if (op === "sub") {
    a = randNonZero(-20, 20);
    b = randNonZero(-20, 20);
    ans = a - b;
  } else if (op === "mul") {
    a = randNonZero(-12, 12);
    b = randNonZero(-12, 12);
    ans = a * b;
  } else if (op === "div") {
    // Pastikan pembagian selalu menghasilkan bilangan bulat
    const hasilBagi = randNonZero(-12, 12);
    b = randNonZero(-12, 12);
    a = hasilBagi * b;
    ans = hasilBagi;
  }

  latihanState[op] = { a, b, ans };

  document.getElementById(`${op}-boxA`).textContent = a;
  document.getElementById(`${op}-boxB`).textContent = formatKurung(b);

  const inputEl = document.getElementById(`${op}-input`);
  inputEl.value = "";

  const feedbackEl = document.getElementById(`${op}-feedback`);
  feedbackEl.hidden = true;
  feedbackEl.className = "feedback-box";
}

function cekLatihan(op) {
  const inputVal = document.getElementById(`${op}-input`).value.trim();
  const feedbackEl = document.getElementById(`${op}-feedback`);

  if (inputVal === "") {
    feedbackEl.hidden = false;
    feedbackEl.className = "feedback-box wrong";
    feedbackEl.innerHTML =
      "<strong>Ups!</strong> Ketik angka jawabanmu terlebih dahulu sebelum menekan Cek Jawaban.";
    return;
  }

  const userAns = Number(inputVal);
  const { a, b, ans } = latihanState[op];

  feedbackEl.hidden = false;

  if (userAns === ans) {
    feedbackEl.className = "feedback-box correct";
    feedbackEl.innerHTML = `<strong>Hebat! Jawabanmu Benar (${ans})!</strong><br>Klik tombol <em>"Coba Lagi"</em> untuk berlatih dengan angka baru.`;
  } else {
    feedbackEl.className = "feedback-box wrong";
    feedbackEl.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}, seharusnya ${ans}.</strong><br>${buatPenjelasanLatihan(op, a, b, ans)}`;
  }
}

function buatPenjelasanLatihan(op, a, b, ans) {
  const bStr = formatKurung(b);

  if (op === "add") {
    if ((a > 0 && b > 0) || (a < 0 && b < 0)) {
      return `<strong>Penjelasan:</strong> Kedua bilangan bertanda sama (${a} dan ${bStr}), sehingga angkanya dijumlahkan (${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(ans)}) dan tandanya mengikuti keduanya, yaitu <strong>${ans}</strong>.`;
    }
    return `<strong>Penjelasan:</strong> Kedua bilangan berbeda tanda (${a} dan ${bStr}). Cari selisihnya (${Math.max(Math.abs(a), Math.abs(b))} &minus; ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(ans)}), lalu ikuti tanda bilangan terbesar, sehingga hasilnya <strong>${ans}</strong>.`;
  }

  if (op === "sub") {
    if (b < 0) {
      return `<strong>Penjelasan:</strong> Mengurangi bilangan negatif sama dengan menjumlahkan: <code>${a} &minus; (${b}) = ${a} + ${Math.abs(b)} = ${ans}</code>.`;
    }
    return `<strong>Penjelasan:</strong> Ubah pengurangan menjadi penjumlahan dengan lawannya: <code>${a} &minus; ${b} = ${a} + (-${b}) = ${ans}</code>.`;
  }

  if (op === "mul") {
    const aturan =
      (a > 0 && b > 0) || (a < 0 && b < 0)
        ? "tanda yang sama menghasilkan bilangan <strong>positif (+)</strong>"
        : "tanda yang berbeda menghasilkan bilangan <strong>negatif (&minus;)</strong>";
    return `<strong>Penjelasan:</strong> Kalikan angkanya (${Math.abs(a)} &times; ${Math.abs(b)} = ${Math.abs(ans)}). Karena ${aturan}, maka <code>${a} &times; ${bStr} = ${ans}</code>.`;
  }

  if (op === "div") {
    const aturan =
      (a > 0 && b > 0) || (a < 0 && b < 0)
        ? "tanda yang sama menghasilkan bilangan <strong>positif (+)</strong>"
        : "tanda yang berbeda menghasilkan bilangan <strong>negatif (&minus;)</strong>";
    return `<strong>Penjelasan:</strong> Bagi angkanya (${Math.abs(a)} &divide; ${Math.abs(b)} = ${Math.abs(ans)}). Karena ${aturan}, maka <code>${a} &divide; ${bStr} = ${ans}</code>.`;
  }
}

// =======================================================
// BAGIAN 2: GENERATOR 15 SOAL TES KEMAMPUAN (ABCD)
// =======================================================
function buatPilihanGanda(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const val of kandidatSalah) {
    if (setOpsi.size < 4 && Number.isFinite(val)) {
      setOpsi.add(val);
    }
  }
  let offset = 1;
  while (setOpsi.size < 4) {
    setOpsi.add(jawabanBenar + offset);
    if (setOpsi.size < 4) setOpsi.add(jawabanBenar - offset);
    offset++;
  }
  // Acak urutan opsi
  return Array.from(setOpsi).sort(() => Math.random() - 0.5);
}

function generate15Soal() {
  const bankSoal = [];

  // 1. Penjumlahan dasar
  {
    const a = randInt(-25, -5);
    const b = randInt(8, 30);
    const ans = a + b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${a} + ${b} adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [-ans, a - b, Math.abs(a) + b]),
      bahas: `${a} + ${b} = ${ans} (selisih ${b} dan ${Math.abs(a)}, bertanda positif karena ${b} > ${Math.abs(a)}).`,
    });
  }

  // 2. Penjumlahan dua negatif
  {
    const a = randInt(-28, -9);
    const b = randInt(-22, -6);
    const ans = a + b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${a} + (${b}) adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [-ans, a - b, Math.abs(a) - Math.abs(b)]),
      bahas: `${a} + (${b}) = ${ans}.`,
    });
  }

  // 3. Pengurangan bertemu negatif
  {
    const a = randInt(-18, 15);
    const b = randInt(-20, -4);
    const ans = a - b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${a} &minus; (${b}) adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [a + b, -ans, b - a]),
      bahas: `${a} &minus; (${b}) = ${a} + ${Math.abs(b)} = ${ans}.`,
    });
  }

  // 4. Perkalian negatif & positif
  {
    const a = randInt(-14, -4);
    const b = randInt(5, 13);
    const ans = a * b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${a} &times; ${b} adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [-ans, a + b, ans - b]),
      bahas: `Negatif dikali positif menghasilkan negatif: ${a} &times; ${b} = ${ans}.`,
    });
  }

  // 5. Perkalian negatif & negatif
  {
    const a = randInt(-12, -3);
    const b = randInt(-11, -3);
    const ans = a * b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari (${a}) &times; (${b}) adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [-ans, a + b, Math.abs(a) + Math.abs(b)]),
      bahas: `Negatif dikali negatif menghasilkan positif: (${a}) &times; (${b}) = ${ans}.`,
    });
  }

  // 6. Pembagian bilangan bulat
  {
    const ans = randNonZero(-14, 14);
    const b = randInt(-11, -3);
    const a = ans * b;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${formatKurung(a)} &divide; (${b}) adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [-ans, ans + 2, ans - 2]),
      bahas: `${formatKurung(a)} &divide; (${b}) = ${ans}.`,
    });
  }

  // 7. Operasi hitung campuran (perkalian didahulukan)
  {
    const a = randInt(10, 25);
    const b = randInt(-6, -2);
    const c = randInt(3, 7);
    const ans = a + b * c;
    bankSoal.push({
      tipe: "Operasi Campuran",
      tanya: `Hasil dari ${a} + (${b}) &times; ${c} adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [(a + b) * c, a - b * c, -ans]),
      bahas: `Kerjakan perkalian terlebih dahulu: ${a} + (${b * c}) = ${ans}.`,
    });
  }

  // 8. Operasi hitung campuran (pembagian & pengurangan)
  {
    const hasilBagi = randInt(-9, -2);
    const pembagi = randInt(3, 7);
    const depan = hasilBagi * pembagi;
    const kurang = randInt(-10, -2);
    const ans = hasilBagi - kurang;
    bankSoal.push({
      tipe: "Operasi Campuran",
      tanya: `Nilai dari (${depan}) &divide; ${pembagi} &minus; (${kurang}) adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [hasilBagi + kurang, -ans, hasilBagi * 2]),
      bahas: `(${depan}) &divide; ${pembagi} = ${hasilBagi}, kemudian ${hasilBagi} &minus; (${kurang}) = ${hasilBagi} + ${Math.abs(kurang)} = ${ans}.`,
    });
  }

  // 9. Soal Cerita 1: Suhu Kulkas / Freezer
  {
    const suhuAwal = randInt(-8, -2);
    const naikPerJam = randInt(2, 4);
    const jam = randInt(3, 5);
    const ans = suhuAwal + naikPerJam * jam;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Suhu di dalam sebuah lemari es mula-mula ${suhuAwal}&deg;C. Karena listrik padam, suhu di dalamnya naik ${naikPerJam}&deg;C setiap jam. Suhu lemari es tersebut setelah ${jam} jam adalah .... (&deg;C)`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        suhuAwal - naikPerJam * jam,
        suhuAwal + naikPerJam,
        -ans,
      ]),
      bahas: `Suhu akhir = ${suhuAwal} + (${naikPerJam} &times; ${jam}) = ${suhuAwal} + ${naikPerJam * jam} = ${ans}&deg;C.`,
    });
  }

  // 10. Soal Cerita 2: Kapal Selam / Penyelam
  {
    const dalamAwal = randInt(40, 85);
    const naik = randInt(15, 30);
    const turunLagi = randInt(10, 25);
    const ans = -dalamAwal + naik - turunLagi;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Sebuah kapal selam berada pada kedalaman ${dalamAwal} meter di bawah permukaan laut (-${dalamAwal} m). Kapal tersebut naik sejauh ${naik} meter, kemudian menyelam kembali sejauh ${turunLagi} meter. Posisi kapal selam sekarang adalah .... (meter)`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        -ans,
        -dalamAwal - naik + turunLagi,
        -dalamAwal + naik + turunLagi,
      ]),
      bahas: `Posisi = -${dalamAwal} + ${naik} &minus; ${turunLagi} = ${ans} meter.`,
    });
  }

  // 11. Soal Cerita 3: Skor Olimpiade Matematika
  {
    const totalSoal = 25;
    const benar = randInt(14, 19);
    const salah = randInt(3, 5);
    const kosong = totalSoal - benar - salah;
    const ans = benar * 4 + salah * -2 + kosong * -1;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Dalam suatu kompetisi matematika terdiri dari ${totalSoal} soal. Jawaban benar diberi skor 4, salah diberi skor -2, dan tidak dijawab diberi skor -1. Jika Rani menjawab benar ${benar} soal dan salah ${salah} soal, total skor yang diperoleh Rani adalah ....`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        benar * 4 - salah * 2,
        benar * 4 + salah * 2,
        ans + 5,
      ]),
      bahas: `Tidak dijawab = ${totalSoal} &minus; ${benar} &minus; ${salah} = ${kosong} soal. Total skor = (${benar} &times; 4) + (${salah} &times; -2) + (${kosong} &times; -1) = ${benar * 4} &minus; ${salah * 2} &minus; ${kosong} = ${ans}.`,
    });
  }

  // 12. Soal Cerita 4: Selisih Suhu Dua Kota
  {
    const suhuKotaA = randInt(-12, -3);
    const suhuKotaB = randInt(18, 32);
    const ans = suhuKotaB - suhuKotaA;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Suhu udara di Kota Tokyo pada musim dingin tercatat ${suhuKotaA}&deg;C, sedangkan pada waktu yang sama suhu di Kota Surabaya mencapai ${suhuKotaB}&deg;C. Selisih suhu antara kedua kota tersebut adalah .... (&deg;C)`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        suhuKotaB + suhuKotaA,
        suhuKotaA - suhuKotaB,
        ans - 4,
      ]),
      bahas: `Selisih = suhu tertinggi &minus; suhu terendah = ${suhuKotaB} &minus; (${suhuKotaA}) = ${suhuKotaB} + ${Math.abs(suhuKotaA)} = ${ans}&deg;C.`,
    });
  }

  // 13. Soal Cerita 5: Lift Gedung Bertingkat
  {
    const lantaiAwal = randInt(6, 12);
    const turun = lantaiAwal + randInt(1, 3); // Masuk basement (lantai negatif)
    const naik = randInt(5, 9);
    const ans = lantaiAwal - turun + naik;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Budi berada di lantai ${lantaiAwal} sebuah gedung perkantoran. Ia turun menggunakan lift sebanyak ${turun} lantai untuk mengambil barang, lalu naik kembali ${naik} lantai. Di lantai berapakah Budi berada sekarang?`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        lantaiAwal - turun - naik,
        -ans,
        lantaiAwal + turun - naik,
      ]),
      bahas: `Posisi lantai = ${lantaiAwal} &minus; ${turun} + ${naik} = ${ans}.`,
    });
  }

  // 14. Soal Cerita 6: Pembagian Daging Kurban / Paket Sembako
  {
    const anggota = randInt(6, 12);
    const perOrang = randInt(4, 9);
    const total = anggota * perOrang;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Panitia bakti sosial memiliki ${total} paket alat tulis yang akan dibagikan secara merata kepada ${anggota} kelompok belajar. Banyak paket yang diterima setiap kelompok adalah ....`,
      jawaban: perOrang,
      opsi: buatPilihanGanda(perOrang, [
        perOrang + 2,
        perOrang - 1,
        total - anggota,
      ]),
      bahas: `Setiap kelompok menerima ${total} &divide; ${anggota} = ${perOrang} paket.`,
    });
  }

  // 15. Soal Cerita 7: Suhu Daging Keluar dari Freezer
  {
    const suhuAwal = randInt(-15, -6);
    const kenaikan = randInt(3, 5);
    const menit = randInt(12, 20); // kelipatan 4
    const interval = 4;
    const kaliNaik = Math.floor(menit / interval);
    const totalMenit = kaliNaik * interval;
    const ans = suhuAwal + kaliNaik * kenaikan;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Sebongkah daging beku bersuhu ${suhuAwal}&deg;C dikeluarkan dari lemari pembeku. Setiap ${interval} menit, suhu daging naik sebesar ${kenaikan}&deg;C. Suhu daging setelah didiamkan selama ${totalMenit} menit adalah .... (&deg;C)`,
      jawaban: ans,
      opsi: buatPilihanGanda(ans, [
        suhuAwal + totalMenit * kenaikan,
        suhuAwal - kaliNaik * kenaikan,
        -ans,
      ]),
      bahas: `Banyak kenaikan = ${totalMenit} &divide; ${interval} = ${kaliNaik} kali. Suhu akhir = ${suhuAwal} + (${kaliNaik} &times; ${kenaikan}) = ${suhuAwal} + ${kaliNaik * kenaikan} = ${ans}&deg;C.`,
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
        (nilaiOpsi, idxOpsi) => `
        <label class="option-label" id="opt-label-${index}-${idxOpsi}">
          <input type="radio" name="soal_${index}" value="${nilaiOpsi}" />
          <span><strong>${hurufOpsi[idxOpsi]}.</strong> ${nilaiOpsi}</span>
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

  // Cek apakah semua 15 soal sudah dijawab
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

  // Evaluasi setiap soal & tampilkan kunci + pembahasan
  soalTesAktif.forEach((soal, idx) => {
    const radios = document.querySelectorAll(`input[name="soal_${idx}"]`);
    const terpilih = document.querySelector(
      `input[name="soal_${idx}"]:checked`,
    );
    const jawabanUser = Number(terpilih.value);
    const isBenar = jawabanUser === soal.jawaban;

    if (isBenar) jumlahBenar++;

    radios.forEach((radio, optIdx) => {
      radio.disabled = true;
      const label = document.getElementById(`opt-label-${idx}-${optIdx}`);
      const val = Number(radio.value);

      if (val === soal.jawaban) {
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

  // Kirim ke Google Apps Script (metode antrean 3 percobaan terakhir)
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
        materi: "NILAI_BILANGAN_BUAT",
        skor: skorBaru,
      }),
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      // Perbarui localStorage dengan antrean 3 percobaan terbaru dari server
      const rekapNilai = JSON.parse(
        localStorage.getItem("mathzone_nilai") || "{}",
      );
      rekapNilai.NILAI_BILANGAN_BUAT = hasil.riwayat_string || skorBaru;
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
  const nilaiBilbul = rekapNilai.NILAI_BILANGAN_BUAT;

  if (nilaiBilbul !== null && nilaiBilbul !== undefined && nilaiBilbul !== "") {
    pill.textContent = `Riwayat Nilai (Maks. 3 Percobaan): ${nilaiBilbul}`;
  } else {
    pill.textContent = "Riwayat Nilai: Belum ada";
  }
}
