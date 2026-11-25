const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzh2IW_YTseWWk0xKk2L5w0RVtOlIfHxyjV54rvJuOkECMpSPDKidKTrdpztaY9H7O9/exec";

const latihanState = {
  nom: { hb: 40000, hj: 52000, status: "Untung", selisih: 12000 },
  pu: { hb: 50000, hj: 60000, untung: 10000, persen: 20 },
  pr: { hb: 80000, hj: 68000, rugi: 12000, persen: 15 },
  hj: { hb: 100000, tipe: "Untung", persen: 20, hj: 120000 },
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
  buatSoalLatihan("nom");
  buatSoalLatihan("pu");
  buatSoalLatihan("pr");
  buatSoalLatihan("hj");

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
// FUNGSI BANTU FORMAT RUPIAH & ANGKA ACAK
// =======================================================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pilihAcak(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function parseAngkaRupiah(str) {
  const bersih = String(str || "").replace(/[^0-9]/g, "");
  return bersih === "" ? NaN : Number(bersih);
}

// =======================================================
// BAGIAN 1: LATIHAN INTERAKTIF PER MATERI
// =======================================================
function buatSoalLatihan(tipe) {
  if (tipe === "nom") {
    const hb = randInt(3, 18) * 5000; // Rp 15.000 - Rp 90.000
    const isUntung = Math.random() > 0.45;
    const selisih = randInt(1, 6) * 2500;
    const hj = isUntung ? hb + selisih : Math.max(5000, hb - selisih);
    const selisihAsli = Math.abs(hj - hb);
    const status = hj >= hb ? "Untung" : "Rugi";

    latihanState.nom = { hb, hj, status, selisih: selisihAsli };
    document.getElementById("nom-boxA").textContent = formatRupiah(hb);
    document.getElementById("nom-boxB").textContent = formatRupiah(hj);
    document.getElementById("nom-status").value = "";
    document.getElementById("nom-input").value = "";
  }

  if (tipe === "pu") {
    const hb = pilihAcak([
      20000, 25000, 40000, 50000, 60000, 80000, 100000, 120000, 150000, 200000,
    ]);
    const persen = pilihAcak([10, 15, 20, 25, 30, 40, 50]);
    const untung = (hb * persen) / 100;
    const hj = hb + untung;

    latihanState.pu = { hb, hj, untung, persen };
    document.getElementById("pu-boxA").textContent = formatRupiah(hb);
    document.getElementById("pu-boxB").textContent = formatRupiah(hj);
    document.getElementById("pu-input").value = "";
  }

  if (tipe === "pr") {
    const hb = pilihAcak([
      20000, 40000, 50000, 60000, 80000, 100000, 120000, 160000, 200000,
    ]);
    const persen = pilihAcak([10, 15, 20, 25, 30, 40]);
    const rugi = (hb * persen) / 100;
    const hj = hb - rugi;

    latihanState.pr = { hb, hj, rugi, persen };
    document.getElementById("pr-boxA").textContent = formatRupiah(hb);
    document.getElementById("pr-boxB").textContent = formatRupiah(hj);
    document.getElementById("pr-input").value = "";
  }

  if (tipe === "hj") {
    const hb = pilihAcak([
      30000, 40000, 50000, 60000, 80000, 100000, 120000, 150000, 200000,
    ]);
    const isUntung = Math.random() > 0.45;
    const persen = pilihAcak([10, 15, 20, 25, 30]);
    const nominal = (hb * persen) / 100;
    const hj = isUntung ? hb + nominal : hb - nominal;
    const kondisi = isUntung ? "Untung" : "Rugi";

    latihanState.hj = { hb, tipe: kondisi, persen, nominal, hj };
    document.getElementById("hj-boxA").textContent = formatRupiah(hb);
    document.getElementById("hj-boxB").textContent = `${kondisi} ${persen}%`;
    document.getElementById("hj-input").value = "";
  }

  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = true;
  fb.className = "feedback-box";
}

function cekLatihan(tipe) {
  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = false;

  if (tipe === "nom") {
    const userStatus = document.getElementById("nom-status").value;
    const userNom = parseAngkaRupiah(
      document.getElementById("nom-input").value,
    );

    if (!userStatus || Number.isNaN(userNom)) {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Pilih kondisi (<strong>Untung/Rugi</strong>) dan masukkan nominal rupiah terlebih dahulu.";
      return;
    }

    const { hb, hj, status, selisih } = latihanState.nom;
    if (userStatus === status && userNom === selisih) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Hebat! Jawabanmu Benar (${status} ${formatRupiah(selisih)})!</strong><br>Klik <em>"Coba Lagi"</em> untuk berlatih dengan harga baru.`;
    } else {
      const rumus =
        status === "Untung"
          ? `Karena Harga Jual (${formatRupiah(hj)}) &gt; Harga Beli (${formatRupiah(hb)}), maka mengalami <strong>Untung</strong>.<br>Untung = ${formatRupiah(hj)} &minus; ${formatRupiah(hb)} = <strong>${formatRupiah(selisih)}</strong>.`
          : `Karena Harga Jual (${formatRupiah(hj)}) &lt; Harga Beli (${formatRupiah(hb)}), maka mengalami <strong>Rugi</strong>.<br>Rugi = ${formatRupiah(hb)} &minus; ${formatRupiah(hj)} = <strong>${formatRupiah(selisih)}</strong>.`;

      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat!</strong> Seharusnya <strong>${status} ${formatRupiah(selisih)}</strong>.<br><strong>Penjelasan:</strong> ${rumus}`;
    }
    return;
  }

  if (tipe === "pu") {
    const raw = document.getElementById("pu-input").value.trim();
    if (raw === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan angka persentase keuntungan terlebih dahulu.";
      return;
    }

    const userAns = Number(raw);
    const { hb, hj, untung, persen } = latihanState.pu;

    if (userAns === persen) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Benar! Persentase keuntungannya adalah ${persen}%.</strong><br>Klik <em>"Coba Lagi"</em> untuk soal baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}%, seharusnya ${persen}%.</strong><br>
        <strong>Penjelasan:</strong><br>
        1. Untung = ${formatRupiah(hj)} &minus; ${formatRupiah(hb)} = <strong>${formatRupiah(untung)}</strong><br>
        2. %Untung = (${formatRupiah(untung)} &divide; ${formatRupiah(hb)}) &times; 100% = <strong>${persen}%</strong>`;
    }
    return;
  }

  if (tipe === "pr") {
    const raw = document.getElementById("pr-input").value.trim();
    if (raw === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan angka persentase kerugian terlebih dahulu.";
      return;
    }

    const userAns = Number(raw);
    const { hb, hj, rugi, persen } = latihanState.pr;

    if (userAns === persen) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Benar! Persentase kerugiannya adalah ${persen}%.</strong><br>Klik <em>"Coba Lagi"</em> untuk soal baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}%, seharusnya ${persen}%.</strong><br>
        <strong>Penjelasan:</strong><br>
        1. Rugi = ${formatRupiah(hb)} &minus; ${formatRupiah(hj)} = <strong>${formatRupiah(rugi)}</strong><br>
        2. %Rugi = (${formatRupiah(rugi)} &divide; ${formatRupiah(hb)}) &times; 100% = <strong>${persen}%</strong>`;
    }
    return;
  }

  if (tipe === "hj") {
    const userHj = parseAngkaRupiah(document.getElementById("hj-input").value);
    if (Number.isNaN(userHj)) {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan nominal Harga Jual terlebih dahulu.";
      return;
    }

    const { hb, tipe: kondisi, persen, nominal, hj } = latihanState.hj;

    if (userHj === hj) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Sempurna! Harga Jual yang tepat adalah ${formatRupiah(hj)}.</strong><br>Klik <em>"Coba Lagi"</em> untuk mencoba soal baru.`;
    } else {
      const tanda = kondisi === "Untung" ? "+" : "&minus;";
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${formatRupiah(userHj)}, seharusnya ${formatRupiah(hj)}.</strong><br>
        <strong>Penjelasan:</strong><br>
        1. Besar ${kondisi} = ${persen}% &times; ${formatRupiah(hb)} = <strong>${formatRupiah(nominal)}</strong><br>
        2. Harga Jual = ${formatRupiah(hb)} ${tanda} ${formatRupiah(nominal)} = <strong>${formatRupiah(hj)}</strong>`;
    }
  }
}

// =======================================================
// BAGIAN 2: GENERATOR 15 SOAL TES KEMAMPUAN (ABCD)
// =======================================================
function buatOpsiRupiah(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const val of kandidatSalah) {
    if (setOpsi.size < 4 && Number.isFinite(val) && val > 0) {
      setOpsi.add(val);
    }
  }
  let langkah = 5000;
  while (setOpsi.size < 4) {
    setOpsi.add(jawabanBenar + langkah);
    if (setOpsi.size < 4 && jawabanBenar - langkah > 0) {
      setOpsi.add(jawabanBenar - langkah);
    }
    langkah += 5000;
  }
  return Array.from(setOpsi)
    .sort(() => Math.random() - 0.5)
    .map((v) => formatRupiah(v));
}

function buatOpsiPersen(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const val of kandidatSalah) {
    if (setOpsi.size < 4 && Number.isFinite(val) && val > 0) {
      setOpsi.add(val);
    }
  }
  let offset = 5;
  while (setOpsi.size < 4) {
    setOpsi.add(jawabanBenar + offset);
    if (setOpsi.size < 4 && jawabanBenar - offset > 0) {
      setOpsi.add(jawabanBenar - offset);
    }
    offset += 5;
  }
  return Array.from(setOpsi)
    .sort(() => Math.random() - 0.5)
    .map((v) => `${v}%`);
}

function generate15Soal() {
  const bankSoal = [];

  // 1. Hitungan: Menentukan Besar Keuntungan
  {
    const hb = randInt(8, 25) * 10000;
    const untung = randInt(2, 7) * 5000;
    const hj = hb + untung;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Harga pembelian suatu barang adalah ${formatRupiah(hb)}, kemudian dijual kembali seharga ${formatRupiah(hj)}. Besar keuntungan yang diperoleh adalah ....`,
      jawaban: formatRupiah(untung),
      opsi: buatOpsiRupiah(untung, [untung + 5000, untung + 10000, hj]),
      bahas: `Untung = Harga Jual − Harga Beli = ${formatRupiah(hj)} − ${formatRupiah(hb)} = ${formatRupiah(untung)}.`,
    });
  }

  // 2. Hitungan: Menentukan Besar Kerugian
  {
    const hb = randInt(12, 30) * 10000;
    const rugi = randInt(3, 8) * 5000;
    const hj = hb - rugi;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Sebuah barang dibeli dengan harga ${formatRupiah(hb)} dan dijual dengan harga ${formatRupiah(hj)}. Besar kerugian yang dialami adalah ....`,
      jawaban: formatRupiah(rugi),
      opsi: buatOpsiRupiah(rugi, [rugi + 5000, rugi * 2, hj]),
      bahas: `Rugi = Harga Beli − Harga Jual = ${formatRupiah(hb)} − ${formatRupiah(hj)} = ${formatRupiah(rugi)}.`,
    });
  }

  // 3. Hitungan: Persentase Untung
  {
    const hb = pilihAcak([40000, 50000, 80000, 100000, 150000, 200000]);
    const persen = pilihAcak([10, 15, 20, 25, 30]);
    const untung = (hb * persen) / 100;
    const hj = hb + untung;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Harga beli sebuah tas adalah ${formatRupiah(hb)}. Jika tas tersebut dijual seharga ${formatRupiah(hj)}, persentase keuntungannya adalah ....`,
      jawaban: `${persen}%`,
      opsi: buatOpsiPersen(persen, [persen + 5, persen + 10, persen - 5]),
      bahas: `Untung = ${formatRupiah(untung)}. %Untung = (${formatRupiah(untung)} ÷ ${formatRupiah(hb)}) × 100% = ${persen}%.`,
    });
  }

  // 4. Hitungan: Persentase Rugi
  {
    const hb = pilihAcak([50000, 80000, 100000, 120000, 160000, 200000]);
    const persen = pilihAcak([10, 15, 20, 25]);
    const rugi = (hb * persen) / 100;
    const hj = hb - rugi;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Sebuah jam tangan dibeli dengan harga ${formatRupiah(hb)}, lalu dijual kembali seharga ${formatRupiah(hj)}. Persentase kerugiannya adalah ....`,
      jawaban: `${persen}%`,
      opsi: buatOpsiPersen(persen, [persen + 5, persen * 2, persen - 5]),
      bahas: `Rugi = ${formatRupiah(rugi)}. %Rugi = (${formatRupiah(rugi)} ÷ ${formatRupiah(hb)}) × 100% = ${persen}%.`,
    });
  }

  // 5. Hitungan: Menentukan Harga Jual (Untung %)
  {
    const hb = pilihAcak([60000, 80000, 100000, 120000, 150000, 200000]);
    const persen = pilihAcak([10, 15, 20, 25]);
    const hj = hb + (hb * persen) / 100;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Sebuah barang dibeli dengan harga ${formatRupiah(hb)}. Agar memperoleh keuntungan ${persen}%, barang tersebut harus dijual dengan harga ....`,
      jawaban: formatRupiah(hj),
      opsi: buatOpsiRupiah(hj, [
        hb - (hb * persen) / 100,
        hj + 10000,
        hb + 5000,
      ]),
      bahas: `Untung = ${persen}% × ${formatRupiah(hb)} = ${formatRupiah((hb * persen) / 100)}. Harga Jual = ${formatRupiah(hb)} + ${formatRupiah((hb * persen) / 100)} = ${formatRupiah(hj)}.`,
    });
  }

  // 6. Hitungan: Menentukan Harga Jual (Rugi %)
  {
    const hb = pilihAcak([80000, 100000, 120000, 150000, 200000, 250000]);
    const persen = pilihAcak([10, 20, 25]);
    const hj = hb - (hb * persen) / 100;
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Harga beli suatu barang adalah ${formatRupiah(hb)}. Jika barang tersebut dijual dengan kerugian ${persen}%, harga jualnya adalah ....`,
      jawaban: formatRupiah(hj),
      opsi: buatOpsiRupiah(hj, [
        hb + (hb * persen) / 100,
        hj - 10000,
        hb - 5000,
      ]),
      bahas: `Rugi = ${persen}% × ${formatRupiah(hb)} = ${formatRupiah((hb * persen) / 100)}. Harga Jual = ${formatRupiah(hb)} − ${formatRupiah((hb * persen) / 100)} = ${formatRupiah(hj)}.`,
    });
  }

  // 7. Hitungan: Menentukan Harga Beli dari Harga Jual & %Untung
  {
    const hb = pilihAcak([40000, 50000, 80000, 100000, 120000, 200000]);
    const persen = pilihAcak([10, 20, 25, 50]);
    const hj = hb + (hb * persen) / 100;
    bankSoal.push({
      tipe: "Konsep Balik",
      tanya: `Seorang pedagang menjual sepasang sepatu seharga ${formatRupiah(hj)} dan memperoleh keuntungan ${persen}%. Harga pembelian sepatu tersebut adalah ....`,
      jawaban: formatRupiah(hb),
      opsi: buatOpsiRupiah(hb, [
        hj - (hj * persen) / 100,
        hb + 10000,
        hb - 10000,
      ]),
      bahas: `Harga Beli = (100 ÷ ${100 + persen}) × ${formatRupiah(hj)} = ${formatRupiah(hb)}.`,
    });
  }

  // 8. Hitungan: Menentukan Harga Beli dari Harga Jual & %Rugi
  {
    const hb = pilihAcak([50000, 80000, 100000, 120000, 160000, 200000]);
    const persen = pilihAcak([10, 20, 25]);
    const hj = hb - (hb * persen) / 100;
    bankSoal.push({
      tipe: "Konsep Balik",
      tanya: `Sebuah tas dijual seharga ${formatRupiah(hj)}. Dari penjualan itu pedagang mengalami kerugian ${persen}%. Harga pembelian tas tersebut adalah ....`,
      jawaban: formatRupiah(hb),
      opsi: buatOpsiRupiah(hb, [
        hj + (hj * persen) / 100,
        hb + 15000,
        hb - 10000,
      ]),
      bahas: `Harga Beli = (100 ÷ ${100 - persen}) × ${formatRupiah(hj)} = ${formatRupiah(hb)}.`,
    });
  }

  // 9. Soal Cerita 1: Pembelian 1 Lusin Buku Tulis
  {
    const hargaLusin = pilihAcak([36000, 48000, 60000]);
    const hargaPerBuku = hargaLusin / 12;
    const untungPerBuku = pilihAcak([1000, 1500, 2000]);
    const jualPerBuku = hargaPerBuku + untungPerBuku;
    const totalUntung = untungPerBuku * 12;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Koperasi sekolah membeli 1 lusin (12 buah) buku tulis dengan harga ${formatRupiah(hargaLusin)}. Buku tersebut dijual kembali secara eceran dengan harga ${formatRupiah(jualPerBuku)} per buah. Total keuntungan koperasi jika semua buku habis terjual adalah ....`,
      jawaban: formatRupiah(totalUntung),
      opsi: buatOpsiRupiah(totalUntung, [
        untungPerBuku,
        totalUntung + 6000,
        jualPerBuku * 12,
      ]),
      bahas: `Total harga jual = 12 × ${formatRupiah(jualPerBuku)} = ${formatRupiah(jualPerBuku * 12)}. Keuntungan = ${formatRupiah(jualPerBuku * 12)} − ${formatRupiah(hargaLusin)} = ${formatRupiah(totalUntung)}.`,
    });
  }

  // 10. Soal Cerita 2: Modal + Biaya Perbaikan (Sepeda Bekas)
  {
    const beli = pilihAcak([400000, 500000, 600000]);
    const servis = pilihAcak([100000, 150000, 200000]);
    const modal = beli + servis;
    const persenUntung = pilihAcak([10, 20, 25]);
    const hj = modal + (modal * persenUntung) / 100;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Pak Andi membeli sebuah sepeda bekas seharga ${formatRupiah(beli)}, lalu mengeluarkan biaya perbaikan sebesar ${formatRupiah(servis)}. Jika sepeda tersebut dijual kembali seharga ${formatRupiah(hj)}, persentase keuntungan yang diperoleh Pak Andi adalah ....`,
      jawaban: `${persenUntung}%`,
      opsi: buatOpsiPersen(persenUntung, [
        persenUntung + 5,
        persenUntung + 10,
        persenUntung - 5,
      ]),
      bahas: `Modal total = ${formatRupiah(beli)} + ${formatRupiah(servis)} = ${formatRupiah(modal)}. Untung = ${formatRupiah(hj)} − ${formatRupiah(modal)} = ${formatRupiah(hj - modal)}. %Untung = (${formatRupiah(hj - modal)} ÷ ${formatRupiah(modal)}) × 100% = ${persenUntung}%.`,
    });
  }

  // 11. Soal Cerita 3: Pedagang Buah (Sebagian Busuk)
  {
    const beratBeli = pilihAcak([20, 25, 30]);
    const hargaPerKg = pilihAcak([10000, 12000, 15000]);
    const modal = beratBeli * hargaPerKg;
    const busuk = pilihAcak([3, 4, 5]);
    const sisaKg = beratBeli - busuk;
    const jualPerKg = hargaPerKg + 1000;
    const totalJual = sisaKg * jualPerKg;
    const rugi = modal - totalJual;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Seorang pedagang buah membeli ${beratBeli} kg jeruk dengan harga ${formatRupiah(hargaPerKg)} per kg. Setelah diperiksa, ternyata ${busuk} kg jeruk busuk dan tidak dapat dijual. Sisanya dijual dengan harga ${formatRupiah(jualPerKg)} per kg. Besar kerugian pedagang tersebut adalah ....`,
      jawaban: formatRupiah(rugi),
      opsi: buatOpsiRupiah(rugi, [
        busuk * hargaPerKg,
        rugi + 10000,
        modal - sisaKg * hargaPerKg,
      ]),
      bahas: `Modal = ${beratBeli} × ${formatRupiah(hargaPerKg)} = ${formatRupiah(modal)}. Penjualan = ${sisaKg} × ${formatRupiah(jualPerKg)} = ${formatRupiah(totalJual)}. Rugi = ${formatRupiah(modal)} − ${formatRupiah(totalJual)} = ${formatRupiah(rugi)}.`,
    });
  }

  // 12. Soal Cerita 4: Penjualan Bakso / Minuman per Porsi
  {
    const modal = pilihAcak([300000, 400000, 500000]);
    const porsi = pilihAcak([40, 50]);
    const persen = pilihAcak([20, 25]);
    const totalTarget = modal + (modal * persen) / 100;
    const hargaPerPorsi = totalTarget / porsi;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Bu Rina mengeluarkan modal sebesar ${formatRupiah(modal)} untuk membuat ${porsi} porsi soto ayam. Jika Bu Rina menginginkan keuntungan sebesar ${persen}% dari modalnya, harga jual per porsi soto adalah ....`,
      jawaban: formatRupiah(hargaPerPorsi),
      opsi: buatOpsiRupiah(hargaPerPorsi, [
        modal / porsi,
        hargaPerPorsi + 1500,
        hargaPerPorsi - 1000,
      ]),
      bahas: `Target penjualan = ${formatRupiah(modal)} + (${persen}% × ${formatRupiah(modal)}) = ${formatRupiah(totalTarget)}. Harga per porsi = ${formatRupiah(totalTarget)} ÷ ${porsi} = ${formatRupiah(hargaPerPorsi)}.`,
    });
  }

  // 13. Soal Cerita 5: Persentase Kerugian Penjualan Laptop / Ponsel
  {
    const hb = pilihAcak([2000000, 2500000, 3000000, 4000000]);
    const persenRugi = pilihAcak([10, 15, 20, 25]);
    const hj = hb - (hb * persenRugi) / 100;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Rudi membeli sebuah ponsel baru seharga ${formatRupiah(hb)}. Setelah dipakai beberapa bulan, ponsel tersebut dijual seharga ${formatRupiah(hj)}. Persentase kerugian yang dialami Rudi adalah ....`,
      jawaban: `${persenRugi}%`,
      opsi: buatOpsiPersen(persenRugi, [
        persenRugi + 5,
        persenRugi + 10,
        persenRugi - 5,
      ]),
      bahas: `Rugi = ${formatRupiah(hb)} − ${formatRupiah(hj)} = ${formatRupiah(hb - hj)}. %Rugi = (${formatRupiah(hb - hj)} ÷ ${formatRupiah(hb)}) × 100% = ${persenRugi}%.`,
    });
  }

  // 14. Soal Cerita 6: Pembelian 1 Kodi Pakaian (20 buah)
  {
    const hargaKodi = pilihAcak([800000, 1000000, 1200000]);
    const beliSatuan = hargaKodi / 20;
    const persenUntung = pilihAcak([15, 20, 25]);
    const jualSatuan = beliSatuan + (beliSatuan * persenUntung) / 100;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Sebuah toko pakaian membeli 1 kodi (20 potong) kemeja dengan harga ${formatRupiah(hargaKodi)}. Jika toko tersebut ingin mendapatkan untung ${persenUntung}%, harga jual untuk setiap potong kemeja adalah ....`,
      jawaban: formatRupiah(jualSatuan),
      opsi: buatOpsiRupiah(jualSatuan, [
        beliSatuan,
        jualSatuan + 5000,
        jualSatuan - 5000,
      ]),
      bahas: `Harga beli 1 potong = ${formatRupiah(hargaKodi)} ÷ 20 = ${formatRupiah(beliSatuan)}. Harga jual satuan = ${formatRupiah(beliSatuan)} + (${persenUntung}% × ${formatRupiah(beliSatuan)}) = ${formatRupiah(jualSatuan)}.`,
    });
  }

  // 15. Soal Cerita 7: Menentukan Keuntungan dari Persentase & Harga Jual
  {
    const hb = pilihAcak([100000, 200000, 300000, 400000]);
    const persen = pilihAcak([10, 20, 25]);
    const untung = (hb * persen) / 100;
    const hj = hb + untung;
    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Seorang pedagang menjual sebuah barang dengan harga ${formatRupiah(hj)}. Dari penjualan tersebut ia memperoleh keuntungan sebesar ${persen}%. Besar keuntungan (dalam rupiah) yang diperoleh pedagang adalah ....`,
      jawaban: formatRupiah(untung),
      opsi: buatOpsiRupiah(untung, [(hj * persen) / 100, untung + 10000, hb]),
      bahas: `Harga Beli = (100 ÷ ${100 + persen}) × ${formatRupiah(hj)} = ${formatRupiah(hb)}. Maka keuntungan = ${formatRupiah(hj)} − ${formatRupiah(hb)} = ${formatRupiah(untung)}.`,
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
        materi: "UNTUNG_RUGI",
        skor: skorBaru,
      }),
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      const rekapNilai = JSON.parse(
        localStorage.getItem("mathzone_nilai") || "{}",
      );
      rekapNilai.UNTUNG_RUGI = hasil.riwayat_string || skorBaru;
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
  const nilaiUntungRugi = rekapNilai.UNTUNG_RUGI;

  if (
    nilaiUntungRugi !== null &&
    nilaiUntungRugi !== undefined &&
    nilaiUntungRugi !== ""
  ) {
    pill.textContent = `Riwayat Nilai (Maks. 3 Percobaan): ${nilaiUntungRugi}`;
  } else {
    pill.textContent = "Riwayat Nilai: Belum ada";
  }
}
