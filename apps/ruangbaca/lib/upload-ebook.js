import { ebookContentType, ebookFormat, maxEbookSize } from "./ebook-source";

export function validateEbook(file) {
  if (!file?.size || !ebookFormat(file.name)) throw new Error("Pilih file PDF atau EPUB.");
  if (file.size > maxEbookSize) throw new Error("Ukuran maksimal ebook 50 MiB.");
}

async function postUpload(password, body) {
  const response = await fetch("/api/ebooks/upload/", {
    method: "POST",
    headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export async function uploadEbook({ file, title, password, onUploadProgress }) {
  validateEbook(file);
  const format = ebookFormat(file.name);
  const { pathname, token } = await postUpload(password, { action: "prepare", title, format });
  const { put } = await import("@vercel/blob/client");
  await put(pathname, file, {
    access: "private",
    token,
    contentType: ebookContentType[format],
    multipart: file.size > 8 * 1024 * 1024,
    onUploadProgress,
  });
  return postUpload(password, { action: "commit", title, format, pathname });
}
