import { ebookDirectory, ebookOrigin, ebookRepository, uploadedPdfUrl } from "./github-uploads";

const revision = "c9dbf63594ff50c5ccba781e19100e08d7939843";

export function ebookFileUrl(book) {
  return book.source === "github-upload"
    ? uploadedPdfUrl(book.file)
    : `${ebookOrigin}/${ebookRepository}/${revision}/${ebookDirectory[book.format]}/${encodeURIComponent(book.file)}`;
}
