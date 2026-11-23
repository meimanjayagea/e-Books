import { books } from "./catalog";
import { ebookFormat, titleFromFile } from "./ebook-source";

const catalogFiles = new Set(books.map((book) => book.file));

export function uploadedBook(file) {
  const format = ebookFormat(file);
  if (!format || !/^[^./\\\p{Cc}][^/\\\p{Cc}]*\.(pdf|epub)$/iu.test(file)
    || new TextEncoder().encode(file).length > 240 || catalogFiles.has(file)) return null;
  return {
    id: `upload:${file}`,
    title: titleFromFile(file),
    author: "",
    category: "uploads",
    format,
    file,
    source: "github-upload",
  };
}

export async function listUploadedBooks(signal) {
  const response = await fetch("/api/ebooks/", { signal });
  if (!response.ok) throw new Error("Unggahan GitHub belum bisa dimuat.");
  return response.json();
}
