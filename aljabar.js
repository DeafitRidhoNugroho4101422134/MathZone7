const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzh2IW_YTseWWk0xKk2L5w0RVtOlIfHxyjV54rvJuOkECMpSPDKidKTrdpztaY9H7O9/exec";

const latihanState = {
  unsur: { targetVar: "x", koef: 5, konst: 8, expr: "5x - 3y + 8" },
  addsub: { op: "+", a1: 4, b1: 5, a2: 2, b2: -3, ansCoeff: 6, ansConst: 2 },
  mul: { k: 3, a: 2, b: -4, ansCoeff: 6, ansConst: -12 },
  subval: { a: 3, b: 2, c: -4, xVal: 2, yVal: -1, ans: 0 },
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
  buatSoalLatihan("unsur");
  buatSoalLatihan("addsub");
  buatSoalLatihan("mul");
  buatSoalLatihan("subval");

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
// FUNGSI BANTU ALJABAR & ANGKA ACAK
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

function pilihAcak(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Format bentuk linear: ax + b
function formatLinear(coeff, konst, varName = "x") {
  let bagianVar = "";
  if (coeff === 1) bagianVar = varName;
  else if (coeff === -1) bagianVar = `-${varName}`;
  else if (coeff !== 0) bagianVar = `${coeff}${varName}`;

  if (konst === 0) return bagianVar || "0";
  if (!bagianVar) return `${konst}`;

  return konst > 0
    ? `${bagianVar} + ${konst}`
    : `${bagianVar} - ${Math.abs(konst)}`;
}

// Format 2 variabel + konstanta: ax + by + c
function formatDuaVar(kx, ky, c) {
  const suku1 = kx === 1 ? "x" : kx === -1 ? "-x" : `${kx}x`;
  const suku2 =
    ky === 1
      ? "+ y"
      : ky === -1
        ? "- y"
        : ky > 0
          ? `+ ${ky}y`
          : `- ${Math.abs(ky)}y`;
  const suku3 = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  return `${suku1} ${suku2} ${suku3}`;
}

// Parser bentuk aljabar linear (misal "6x + 2", "-x - 4", "2 + 6x")
function parseLinearInput(rawStr, varName = "x") {
  const v = varName.toLowerCase();
  const bersih = String(rawStr || "")
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/\s+/g, "");

  if (!bersih) {
    return { valid: false, alasan: "Jawaban masih kosong." };
  }

  const regexKarakterSah = new RegExp(`^[0-9+${v}-]+$`);
  if (!regexKarakterSah.test(bersih)) {
    return {
      valid: false,
      alasan: `Gunakan hanya angka, tanda <code>+</code> / <code>-</code>, dan variabel <code>${v}</code>.`,
    };
  }

  const sukuList = bersih.match(/[+-]?[^+-]+/g);
  if (!sukuList) {
    return { valid: false, alasan: "Format bentuk aljabar tidak dikenali." };
  }

  let totalCoeff = 0;
  let totalConst = 0;
  let jumlahSukuVar = 0;
  let jumlahSukuConst = 0;

  for (const suku of sukuList) {
    if (suku.includes(v)) {
      const matchVar = suku.match(new RegExp(`^([+-]?\\d*)${v}$`));
      if (!matchVar) {
        return {
          valid: false,
          alasan: `Penulisan suku <code>${suku}</code> belum tepat. Contoh yang benar: <code>3${v}</code> atau <code>-${v}</code>.`,
        };
      }
      const angkaDepan = matchVar[1];
      let nilaiCoeff = 1;
      if (angkaDepan === "" || angkaDepan === "+") nilaiCoeff = 1;
      else if (angkaDepan === "-") nilaiCoeff = -1;
      else nilaiCoeff = Number(angkaDepan);

      totalCoeff += nilaiCoeff;
      jumlahSukuVar++;
    } else {
      if (!/^[+-]?\d+$/.test(suku)) {
        return {
          valid: false,
          alasan: `Penulisan angka <code>${suku}</code> belum tepat.`,
        };
      }
      totalConst += Number(suku);
      jumlahSukuConst++;
    }
  }

  if (jumlahSukuVar > 1 || jumlahSukuConst > 1) {
    return {
      valid: false,
      alasan:
        "Suku-suku yang sejenis masih bisa disederhanakan lagi menjadi satu suku variabel dan satu konstanta.",
    };
  }

  return { valid: true, coeff: totalCoeff, konst: totalConst };
}

// =======================================================
// BAGIAN 1: LATIHAN INTERAKTIF PER MATERI
// =======================================================
function buatSoalLatihan(tipe) {
  if (tipe === "unsur") {
    const kx = randNonZero(-9, 9);
    const ky = randNonZero(-9, 9);
    const c = randNonZero(-15, 15);
    const expr = formatDuaVar(kx, ky, c);
    const targetVar = Math.random() > 0.5 ? "x" : "y";
    const koef = targetVar === "x" ? kx : ky;

    latihanState.unsur = { targetVar, koef, konst: c, expr };
    document.getElementById("unsur-boxA").textContent = expr;
    document.getElementById("unsur-koef-label").textContent =
      `Koefisien ${targetVar} =`;
    document.getElementById("unsur-koef-input").value = "";
    document.getElementById("unsur-konst-input").value = "";
  }

  if (tipe === "addsub") {
    const isTambah = Math.random() > 0.45;
    const op = isTambah ? "+" : "−";
    let a1 = randNonZero(-8, 9);
    let b1 = randNonZero(-10, 10);
    let a2 = randNonZero(-7, 8);
    let b2 = randNonZero(-10, 10);

    // Pastikan hasil koefisien & konstanta tidak nol agar bentuknya tetap ax + b
    while ((isTambah ? a1 + a2 : a1 - a2) === 0) {
      a2 = randNonZero(-7, 8);
    }
    while ((isTambah ? b1 + b2 : b1 - b2) === 0) {
      b2 = randNonZero(-10, 10);
    }

    const ansCoeff = isTambah ? a1 + a2 : a1 - a2;
    const ansConst = isTambah ? b1 + b2 : b1 - b2;

    latihanState.addsub = { op, isTambah, a1, b1, a2, b2, ansCoeff, ansConst };
    document.getElementById("addsub-boxA").textContent =
      `(${formatLinear(a1, b1, "x")})`;
    document.getElementById("addsub-op").textContent = op;
    document.getElementById("addsub-boxB").textContent =
      `(${formatLinear(a2, b2, "x")})`;
    document.getElementById("addsub-input").value = "";
  }

  if (tipe === "mul") {
    const k = pilihAcak([-5, -4, -3, -2, 2, 3, 4, 5, 6]);
    const a = randNonZero(-5, 6);
    const b = randNonZero(-8, 8);
    const ansCoeff = k * a;
    const ansConst = k * b;

    latihanState.mul = { k, a, b, ansCoeff, ansConst };
    document.getElementById("mul-boxA").textContent = k;
    document.getElementById("mul-boxB").textContent =
      `(${formatLinear(a, b, "x")})`;
    document.getElementById("mul-input").value = "";
  }

  if (tipe === "subval") {
    const a = randNonZero(-5, 6);
    const b = randNonZero(-5, 6);
    const c = randNonZero(-10, 10);
    const xVal = randNonZero(-4, 5);
    const yVal = randNonZero(-4, 5);
    const ans = a * xVal + b * yVal + c;

    latihanState.subval = { a, b, c, xVal, yVal, ans };
    document.getElementById("subval-boxA").textContent = formatDuaVar(a, b, c);
    document.getElementById("subval-boxB").textContent =
      `x = ${xVal}, y = ${yVal}`;
    document.getElementById("subval-input").value = "";
  }

  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = true;
  fb.className = "feedback-box";
}

function cekLatihan(tipe) {
  const fb = document.getElementById(`${tipe}-feedback`);
  fb.hidden = false;

  if (tipe === "unsur") {
    const rawKoef = document.getElementById("unsur-koef-input").value.trim();
    const rawKonst = document.getElementById("unsur-konst-input").value.trim();

    if (rawKoef === "" || rawKonst === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Isi kolom <strong>Koefisien</strong> dan <strong>Konstanta</strong> terlebih dahulu.";
      return;
    }

    const { targetVar, koef, konst, expr } = latihanState.unsur;
    const userKoef = Number(rawKoef);
    const userKonst = Number(rawKonst);

    if (userKoef === koef && userKonst === konst) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Hebat! Jawabanmu Benar!</strong><br>Pada <code>${expr}</code>, koefisien <code>${targetVar}</code> adalah <strong>${koef}</strong> dan konstantanya <strong>${konst}</strong>.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat!</strong> Seharusnya koefisien <code>${targetVar}</code> = <strong>${koef}</strong> dan konstanta = <strong>${konst}</strong>.<br>
        <strong>Penjelasan:</strong> Angka yang menempel di depan huruf <code>${targetVar}</code> beserta tandanya adalah <strong>${koef}</strong>, sedangkan bilangan tetap tanpa variabel adalah <strong>${konst}</strong>.`;
    }
    return;
  }

  if (tipe === "addsub") {
    const raw = document.getElementById("addsub-input").value.trim();
    const hasilParse = parseLinearInput(raw, "x");

    if (!hasilParse.valid) {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Ups!</strong> ${hasilParse.alasan}`;
      return;
    }

    const { isTambah, a1, b1, a2, b2, ansCoeff, ansConst } =
      latihanState.addsub;
    const jawabanBenarStr = formatLinear(ansCoeff, ansConst, "x");

    if (hasilParse.coeff === ansCoeff && hasilParse.konst === ansConst) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Benar! Hasil penyederhanaannya adalah ${jawabanBenarStr}.</strong><br>Klik <em>"Coba Lagi"</em> untuk soal baru.`;
    } else {
      const tanda = isTambah ? "+" : "&minus;";
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawaban seharusnya adalah ${jawabanBenarStr}.</strong><br>
        <strong>Penjelasan:</strong><br>
        &bull; Gabungkan suku variabel <code>x</code>: <code>${a1}x ${tanda} (${a2}x) = ${ansCoeff}x</code><br>
        &bull; Gabungkan konstanta: <code>${b1} ${tanda} (${b2}) = ${ansConst}</code><br>
        Sehingga hasilnya <strong>${jawabanBenarStr}</strong>.`;
    }
    return;
  }

  if (tipe === "mul") {
    const raw = document.getElementById("mul-input").value.trim();
    const hasilParse = parseLinearInput(raw, "x");

    if (!hasilParse.valid) {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Ups!</strong> ${hasilParse.alasan}`;
      return;
    }

    const { k, a, b, ansCoeff, ansConst } = latihanState.mul;
    const jawabanBenarStr = formatLinear(ansCoeff, ansConst, "x");

    if (hasilParse.coeff === ansCoeff && hasilParse.konst === ansConst) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Sempurna! Hasil perkaliannya adalah ${jawabanBenarStr}.</strong><br>Klik <em>"Coba Lagi"</em> untuk mencoba soal baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawaban seharusnya adalah ${jawabanBenarStr}.</strong><br>
        <strong>Penjelasan:</strong><br>
        &bull; Kalikan suku pertama: <code>${k} &times; (${a}x) = ${ansCoeff}x</code><br>
        &bull; Kalikan suku kedua: <code>${k} &times; (${b}) = ${ansConst}</code><br>
        Gabungkan keduanya menjadi <strong>${jawabanBenarStr}</strong>.`;
    }
    return;
  }

  if (tipe === "subval") {
    const raw = document.getElementById("subval-input").value.trim();
    if (raw === "") {
      fb.className = "feedback-box wrong";
      fb.innerHTML =
        "<strong>Ups!</strong> Masukkan angka hasil perhitungan terlebih dahulu.";
      return;
    }

    const userAns = Number(raw);
    const { a, b, c, xVal, yVal, ans } = latihanState.subval;

    if (userAns === ans) {
      fb.className = "feedback-box correct";
      fb.innerHTML = `<strong>Hebat! Hasil substitusinya adalah ${ans}.</strong><br>Klik <em>"Coba Lagi"</em> untuk berlatih dengan angka baru.`;
    } else {
      fb.className = "feedback-box wrong";
      fb.innerHTML = `<strong>Kurang tepat! Jawabanmu ${userAns}, seharusnya ${ans}.</strong><br>
        <strong>Penjelasan:</strong><br>
        Ganti <code>x = ${xVal}</code> dan <code>y = ${yVal}</code>:<br>
        <code>= ${a}(${xVal}) + (${b})(${yVal}) + (${c})</code><br>
        <code>= ${a * xVal} + (${b * yVal}) + (${c}) = <strong>${ans}</strong></code>`;
    }
  }
}

// =======================================================
// BAGIAN 2: GENERATOR 15 SOAL TES KEMAMPUAN (ABCD)
// =======================================================
function buatOpsiTeks(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const item of kandidatSalah) {
    if (setOpsi.size < 4 && item && item !== jawabanBenar) {
      setOpsi.add(item);
    }
  }
  let pengubah = 1;
  while (setOpsi.size < 4) {
    setOpsi.add(`${jawabanBenar} + ${pengubah}`);
    pengubah++;
  }
  return Array.from(setOpsi).sort(() => Math.random() - 0.5);
}

function buatOpsiAngka(jawabanBenar, kandidatSalah) {
  const setOpsi = new Set([jawabanBenar]);
  for (const val of kandidatSalah) {
    if (setOpsi.size < 4 && Number.isFinite(val)) {
      setOpsi.add(val);
    }
  }
  let langkah = 2;
  while (setOpsi.size < 4) {
    setOpsi.add(jawabanBenar + langkah);
    if (setOpsi.size < 4) setOpsi.add(jawabanBenar - langkah);
    langkah += 2;
  }
  return Array.from(setOpsi)
    .sort(() => Math.random() - 0.5)
    .map(String);
}

function generate15Soal() {
  const bankSoal = [];

  // 1. Hitungan: Koefisien pada bentuk aljabar kuadrat
  {
    const a = randInt(2, 7);
    const b = randInt(-9, -2);
    const c = randInt(3, 12);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Koefisien variabel x dari bentuk aljabar ${a}x² − ${Math.abs(b)}x + ${c} adalah ....`,
      jawaban: String(b),
      opsi: buatOpsiAngka(b, [Math.abs(b), a, c]),
      bahas: `Bilangan yang menempel di depan variabel x beserta tandanya adalah ${b}.`,
    });
  }

  // 2. Hitungan: Konstanta pada bentuk aljabar
  {
    const a = randInt(3, 8);
    const b = randInt(2, 6);
    const c = randInt(-14, -3);
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Konstanta dari bentuk aljabar ${a}p + ${b}q − ${Math.abs(c)} adalah ....`,
      jawaban: String(c),
      opsi: buatOpsiAngka(c, [Math.abs(c), a, b]),
      bahas: `Konstanta adalah suku tetap yang tidak memuat variabel, yaitu ${c}.`,
    });
  }

  // 3. Hitungan: Suku-suku sejenis
  {
    const setSejenis = [
      {
        tanya:
          "Pasangan suku-suku sejenis dari bentuk aljabar 4x² − 3xy + 7x² + 5y adalah ....",
        benar: "4x² dan 7x²",
        salah: ["4x² dan −3xy", "−3xy dan 5y", "7x² dan 5y"],
        bahas:
          "Suku sejenis memiliki variabel dan pangkat yang sama persis, yaitu 4x² dan 7x².",
      },
      {
        tanya:
          "Di antara pasangan suku berikut, yang merupakan suku sejenis adalah ....",
        benar: "−5ab dan 8ab",
        salah: ["5a²b dan 5ab²", "3x dan 3y", "6p² dan 6p"],
        bahas:
          "−5ab dan 8ab memiliki variabel yang sama yaitu ab dengan pangkat yang sama.",
      },
      {
        tanya: "Suku yang sejenis dengan −6m²n adalah ....",
        benar: "4m²n",
        salah: ["−6mn²", "4mn", "6m²"],
        bahas:
          "Variabel dan pangkat harus sama persis (m²n), sehingga yang sejenis adalah 4m²n.",
      },
    ];
    const soal = pilihAcak(setSejenis);
    bankSoal.push({
      tipe: "Konsep Dasar",
      tanya: soal.tanya,
      jawaban: soal.benar,
      opsi: buatOpsiTeks(soal.benar, soal.salah),
      bahas: soal.bahas,
    });
  }

  // 4. Hitungan: Penjumlahan Bentuk Aljabar
  {
    const a1 = randInt(3, 8);
    const b1 = randInt(2, 9);
    const a2 = randInt(2, 6);
    const b2 = randInt(-8, -2);
    const cSum = a1 + a2;
    const kSum = b1 + b2;
    const ans = formatLinear(cSum, kSum, "x");
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil penjumlahan dari (${a1}x + ${b1}) dan (${a2}x − ${Math.abs(b2)}) adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        formatLinear(cSum, b1 - b2, "x"),
        formatLinear(a1 - a2, kSum, "x"),
        formatLinear(cSum, -kSum, "x"),
      ]),
      bahas: `(${a1}x + ${a2}x) + (${b1} − ${Math.abs(b2)}) = ${ans}.`,
    });
  }

  // 5. Hitungan: Pengurangan Bentuk Aljabar ("oleh")
  {
    const a1 = randInt(6, 11);
    const b1 = randInt(4, 10);
    const a2 = randInt(2, 5);
    const b2 = randInt(-7, -2);
    const ans = formatLinear(a1 - a2, b1 - b2, "a");
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil pengurangan (${a1}a + ${b1}) oleh (${a2}a − ${Math.abs(b2)}) adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        formatLinear(a1 - a2, b1 + b2, "a"),
        formatLinear(a1 + a2, b1 - b2, "a"),
        formatLinear(a2 - a1, b2 - b1, "a"),
      ]),
      bahas: `(${a1}a + ${b1}) − (${a2}a − ${Math.abs(b2)}) = (${a1} − ${a2})a + (${b1} + ${Math.abs(b2)}) = ${ans}.`,
    });
  }

  // 6. Hitungan: Pengurangan Bentuk Aljabar ("dari")
  {
    const a1 = randInt(2, 5);
    const b1 = randInt(-6, -2);
    const a2 = randInt(7, 12);
    const b2 = randInt(3, 9);
    // "kurangkan A dari B" artinya B - A
    const ans = formatLinear(a2 - a1, b2 - b1, "x");
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil pengurangan (${a1}x − ${Math.abs(b1)}) dari (${a2}x + ${b2}) adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        formatLinear(a1 - a2, b1 - b2, "x"),
        formatLinear(a2 - a1, b2 + b1, "x"),
        formatLinear(a2 + a1, b2 - b1, "x"),
      ]),
      bahas: `Kata "dari" berarti (${a2}x + ${b2}) − (${a1}x − ${Math.abs(b1)}) = (${a2} − ${a1})x + (${b2} + ${Math.abs(b1)}) = ${ans}.`,
    });
  }

  // 7. Hitungan: Perkalian Suku Satu dengan Suku Dua
  {
    const k = pilihAcak([-4, -3, -2, 3, 4, 5]);
    const a = randInt(2, 5);
    const b = randInt(-6, -2);
    const ans = formatLinear(k * a, k * b, "x");
    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil dari ${k}(${a}x − ${Math.abs(b)}) adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        formatLinear(k * a, -k * b, "x"),
        formatLinear(k * a, b, "x"),
        formatLinear(k + a, k * b, "x"),
      ]),
      bahas: `${k} × (${a}x) + ${k} × (${b}) = ${ans}.`,
    });
  }

  // 8. Hitungan: Perkalian Suku Dua dengan Suku Dua
  {
    const p = randInt(2, 6);
    let q = randInt(-5, -1);
    while (p + q === 0) q = randInt(-5, -1);
    const tengah = p + q;
    const ujung = p * q;
    const tengahStr =
      tengah === 1
        ? "+ x"
        : tengah === -1
          ? "- x"
          : tengah > 0
            ? `+ ${tengah}x`
            : `- ${Math.abs(tengah)}x`;
    const ans = `x² ${tengahStr} - ${Math.abs(ujung)}`;

    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil perkalian dari (x + ${p})(x − ${Math.abs(q)}) adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        `x² ${tengah > 0 ? "-" : "+"} ${Math.abs(tengah)}x - ${Math.abs(ujung)}`,
        `x² ${tengahStr} + ${Math.abs(ujung)}`,
        `x² - ${Math.abs(ujung)}`,
      ]),
      bahas: `(x + ${p})(x − ${Math.abs(q)}) = x² − ${Math.abs(q)}x + ${p}x − ${Math.abs(ujung)} = ${ans}.`,
    });
  }

  // 9. Hitungan: Pembagian Bentuk Aljabar
  {
    const pembagi = randInt(2, 5);
    const hasilA = randInt(2, 6);
    const hasilB = randInt(3, 8);
    const depan = pembagi * hasilA;
    const belakang = pembagi * hasilB;
    const ans = `${hasilA}x + ${hasilB}`;

    bankSoal.push({
      tipe: "Hitungan",
      tanya: `Hasil pembagian (${depan}x² + ${belakang}x) oleh ${pembagi}x adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        `${hasilA}x² + ${hasilB}`,
        `${hasilA}x + ${belakang}`,
        `${depan}x + ${hasilB}`,
      ]),
      bahas: `(${depan}x² ÷ ${pembagi}x) + (${belakang}x ÷ ${pembagi}x) = ${ans}.`,
    });
  }

  // 10. Hitungan: Substitusi Nilai Variabel
  {
    const a = randInt(2, 5);
    const b = randInt(2, 4);
    const c = randInt(3, 9);
    const xVal = randInt(2, 4);
    const yVal = randInt(-3, -1);
    const ans = a * xVal - b * yVal + c;

    bankSoal.push({
      tipe: "Substitusi",
      tanya: `Jika nilai x = ${xVal} dan y = ${yVal}, maka nilai dari ${a}x − ${b}y + ${c} adalah ....`,
      jawaban: String(ans),
      opsi: buatOpsiAngka(ans, [a * xVal + b * yVal + c, ans - 4, ans + 6]),
      bahas: `${a}(${xVal}) − ${b}(${yVal}) + ${c} = ${a * xVal} + ${Math.abs(b * yVal)} + ${c} = ${ans}.`,
    });
  }

  // 11. Soal Cerita 1: Keliling Persegi Panjang dalam x
  {
    const pCoeff = randInt(2, 4);
    const pConst = randInt(3, 7);
    const lCoeff = randInt(1, 2);
    const lConst = randInt(-3, -1);
    const kelCoeff = 2 * (pCoeff + lCoeff);
    const kelConst = 2 * (pConst + lConst);
    const ans = `(${formatLinear(kelCoeff, kelConst, "x")}) cm`;

    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Sebuah persegi panjang memiliki ukuran panjang (${pCoeff}x + ${pConst}) cm dan lebar (${formatLinear(lCoeff, lConst, "x")}) cm. Keliling persegi panjang tersebut dalam bentuk x adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        `(${formatLinear(pCoeff + lCoeff, pConst + lConst, "x")}) cm`,
        `(${formatLinear(kelCoeff, pConst + lConst, "x")}) cm`,
        `(${formatLinear(kelCoeff, -kelConst, "x")}) cm`,
      ]),
      bahas: `Keliling = 2 × (panjang + lebar) = 2 × (${formatLinear(pCoeff + lCoeff, pConst + lConst, "x")}) = ${ans}.`,
    });
  }

  // 12. Soal Cerita 2: Luas Persegi Panjang dalam x
  {
    const lebar = randInt(4, 9);
    const tambah = randInt(2, 7);
    const ans = `(${lebar}x + ${lebar * tambah}) cm²`;

    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Panjang sebuah taman berbentuk persegi panjang adalah (x + ${tambah}) meter dan lebarnya ${lebar} meter. Luas taman tersebut dalam bentuk aljabar adalah ....`,
      jawaban: ans.replace("cm²", "m²"),
      opsi: buatOpsiTeks(ans.replace("cm²", "m²"), [
        `(${lebar}x + ${tambah}) m²`,
        `(x + ${lebar + tambah}) m²`,
        `(${lebar}x + ${lebar + tambah}) m²`,
      ]),
      bahas: `Luas = panjang × lebar = ${lebar}(x + ${tambah}) = (${lebar}x + ${lebar * tambah}) m².`,
    });
  }

  // 13. Soal Cerita 3: Kembalian Belanja Alat Tulis
  {
    const uang = pilihAcak([20000, 25000, 50000]);
    const jmlBuku = randInt(3, 6);
    const jmlPensil = randInt(2, 5);
    const ans = `${uang} − ${jmlBuku}x − ${jmlPensil}y`;

    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Harga 1 buku tulis adalah x rupiah dan harga 1 pensil adalah y rupiah. Dina membeli ${jmlBuku} buku tulis dan ${jmlPensil} pensil lalu membayar dengan uang Rp ${uang.toLocaleString("id-ID")}. Bentuk aljabar yang menyatakan uang kembalian Dina adalah ....`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        `${uang} − ${jmlBuku}x + ${jmlPensil}y`,
        `${jmlBuku}x + ${jmlPensil}y − ${uang}`,
        `${uang} + ${jmlBuku}x + ${jmlPensil}y`,
      ]),
      bahas: `Kembalian = Uang bayar − Total belanja = ${uang} − (${jmlBuku}x + ${jmlPensil}y) = ${ans}.`,
    });
  }

  // 14. Soal Cerita 4: Umur dalam Bentuk Aljabar
  {
    const selisih = randInt(3, 7);
    const ans = `2x + ${selisih}`;

    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Umur Raka saat ini adalah x tahun, sedangkan umur kakaknya ${selisih} tahun lebih tua dari Raka. Jumlah umur Raka dan kakaknya saat ini dalam bentuk aljabar adalah .... (tahun)`,
      jawaban: ans,
      opsi: buatOpsiTeks(ans, [
        `x + ${selisih}`,
        `2x − ${selisih}`,
        `x² + ${selisih}`,
      ]),
      bahas: `Umur Raka = x, umur kakak = x + ${selisih}. Jumlah umur = x + (x + ${selisih}) = ${ans}.`,
    });
  }

  // 15. Soal Cerita 5: Keliling Segitiga dengan Nilai x Diketahui
  {
    const a = randInt(2, 5);
    const b = randInt(1, 4);
    const xVal = randInt(4, 8);
    // Sisi: x, (x + a), dan (2x - b) -> Keliling = 4x + a - b
    const keliling = 4 * xVal + a - b;

    bankSoal.push({
      tipe: "Soal Cerita",
      tanya: `Sebuah segitiga memiliki panjang sisi masing-masing x cm, (x + ${a}) cm, dan (2x − ${b}) cm. Jika nilai x = ${xVal}, maka keliling segitiga tersebut adalah .... cm.`,
      jawaban: String(keliling),
      opsi: buatOpsiAngka(keliling, [
        keliling + 4,
        keliling - 3,
        3 * xVal + a - b,
      ]),
      bahas: `Keliling = x + (x + ${a}) + (2x − ${b}) = 4x + ${a - b}. Untuk x = ${xVal}, keliling = 4(${xVal}) + ${a - b} = ${keliling} cm.`,
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
        materi: "ALJABAR",
        skor: skorBaru,
      }),
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      const rekapNilai = JSON.parse(
        localStorage.getItem("mathzone_nilai") || "{}",
      );
      rekapNilai.ALJABAR = hasil.riwayat_string || skorBaru;
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
  const nilaiAljabar = rekapNilai.ALJABAR;

  if (
    nilaiAljabar !== null &&
    nilaiAljabar !== undefined &&
    nilaiAljabar !== ""
  ) {
    pill.textContent = `Riwayat Nilai (Maks. 3 Percobaan): ${nilaiAljabar}`;
  } else {
    pill.textContent = "Riwayat Nilai: Belum ada";
  }
}
