import { catalogRevision, ebookDirectory } from "./ebook-source";

export function ebookFileUrl(book) {
  const collection = book.source === "github-upload" ? "uploads" : `catalog/${catalogRevision}`;
  return `/content/${collection}/${ebookDirectory[book.format]}/${encodeURIComponent(book.file)}`;
}
