export const ebookRepository = "meimanjayagea/e-Books";
export const ebookBranch = "master";
export const catalogRevision = "c9dbf63594ff50c5ccba781e19100e08d7939843";

export const ebookDirectory = { pdf: "pdf", epub: "epup" };
export const ebookContentType = { pdf: "application/pdf", epub: "application/epub+zip" };
export const maxEbookSize = 50 * 1024 * 1024;

export function ebookFormat(name) {
  if (typeof name !== "string") return null;
  return /\.(pdf|epub)$/i.exec(name)?.[1].toLowerCase() ?? null;
}

export function titleFromFile(file) {
  return file.replace(/\.(pdf|epub)$/i, "").trim();
}
