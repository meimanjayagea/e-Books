import { books } from "./catalog";

export const ebookRepository = "meimanjayagea/e-Books";
export const ebookOrigin = "https://raw.githubusercontent.com";
export const ebookDirectory = { pdf: "ebook/pdf", epub: "ebook/epup" };

const branch = "master";
const directory = ebookDirectory.pdf;
const endpoint = `https://api.github.com/repos/${ebookRepository}/contents/${directory}`;
const catalogPdfFiles = new Set(books.filter((book) => book.format === "pdf").map((book) => book.file));
const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };

export const maxPdfSize = 50 * 1024 * 1024;

export function titleFromPdf(file) {
  return file.replace(/\.pdf$/i, "").trim();
}

function validPdfName(name) {
  return typeof name === "string" && /^[^./\\\p{Cc}][^/\\\p{Cc}]*\.pdf$/iu.test(name)
    && new TextEncoder().encode(name).length <= 240;
}

export function uploadedBook(file) {
  if (!validPdfName(file) || catalogPdfFiles.has(file)) return null;
  return {
    id: `upload:${file}`,
    title: titleFromPdf(file),
    author: "",
    category: "uploads",
    format: "pdf",
    file,
    source: "github-upload",
  };
}

export function uploadedPdfUrl(file) {
  return `${ebookOrigin}/${ebookRepository}/${branch}/${directory}/${encodeURIComponent(file)}`;
}

export async function listUploadedBooks(signal) {
  const response = await fetch(`${endpoint}?ref=${branch}`, { signal, cache: "no-store", credentials: "omit" });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error("Unggahan GitHub belum bisa dimuat.");
  const entries = await response.json();
  if (!Array.isArray(entries)) throw new Error("Daftar unggahan GitHub tidak tersedia.");
  return entries.flatMap((entry) => {
    const book = entry.type === "file" ? uploadedBook(entry.name) : null;
    return book ? [book] : [];
  });
}

export async function validatePdf(file) {
  if (!file || !/\.pdf$/i.test(file.name) || !file.size) throw new Error("Pilih file PDF yang valid.");
  if (file.size > maxPdfSize) throw new Error("Ukuran file melebihi 50 MB.");
  const signature = new TextDecoder().decode(await file.slice(0, 1024).arrayBuffer());
  if (!signature.includes("%PDF-")) throw new Error("File ini tidak memiliki format PDF yang valid.");
}

function encodePdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(",") + 1));
    reader.onerror = () => reject(new Error("File tidak bisa dibaca. Pilih file sekali lagi."));
    reader.readAsDataURL(file);
  });
}

export async function uploadPdf({ file, title, token }) {
  await validatePdf(file);
  const name = `${title.trim().normalize("NFC").replace(/\.pdf$/i, "").trim()}.pdf`;
  if (catalogPdfFiles.has(name)) throw new Error("Judul ini sudah ada di katalog. Gunakan judul lain.");
  const book = uploadedBook(name);
  if (!book) throw new Error("Masukkan judul yang singkat dan hindari garis miring atau titik di awal judul.");
  if (!/^github_pat_[a-zA-Z0-9_]+$/.test(token)) throw new Error("Masukkan fine-grained personal access token GitHub yang valid.");

  const content = await encodePdf(file);
  let response;
  try {
    response = await fetch(`${endpoint}/${encodeURIComponent(name)}`, {
      method: "PUT",
      credentials: "omit",
      redirect: "error",
      headers: { ...headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ branch, content, message: `Add ebook: ${book.title}` }),
    });
  } catch {
    throw new Error("Koneksi GitHub terputus. Periksa katalog sebelum mencoba lagi.");
  }

  if (response.status === 201) return book;
  if (response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error("GitHub sedang membatasi permintaan. Coba lagi dalam beberapa saat.");
  }
  if ([401, 403, 404].includes(response.status)) {
    throw new Error("Periksa masa berlaku token dan izin Contents: Read and write untuk repositori e-Books.");
  }
  if (response.status === 422 || response.status === 409) {
    const { message = "" } = await response.json().catch(() => ({}));
    if (/sha|already exists/i.test(message)) throw new Error("Judul ini sudah ada di GitHub. Gunakan judul lain.");
    throw new Error("GitHub menolak commit ini. Periksa katalog lalu coba lagi.");
  }
  if (response.status === 413) throw new Error("GitHub menolak ukuran unggahan ini. Coba file yang lebih kecil.");
  throw new Error("GitHub belum mengonfirmasi unggahan. Periksa katalog sebelum mencoba lagi.");
}
