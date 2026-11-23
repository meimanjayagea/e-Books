import { uploadedPdfUrl } from "./github-uploads";

const source = "https://raw.githubusercontent.com/meimanjayagea/e-Books/d5594cea78b9af2768550bba70cebe67e7c1fcda";

export function ebookFileUrl(book) {
  return book.source === "github-upload"
    ? uploadedPdfUrl(book.file)
    : `${source}/${encodeURIComponent(book.file)}`;
}
