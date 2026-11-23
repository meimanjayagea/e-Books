import { createHash } from "node:crypto";
import { ebookBranch, ebookDirectory, ebookRepository } from "./ebook-source";
import { uploadedBook } from "./github-uploads";

const endpoint = `https://api.github.com/repos/${ebookRepository}/contents/ebook`;
const headers = {
  Accept: "application/vnd.github.object+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const authHeaders = (token) => token ? { ...headers, Authorization: `Bearer ${token}` } : headers;

export async function fetchUploadedBooks(token) {
  const lists = await Promise.all(Object.entries(ebookDirectory).map(async ([format, directory]) => {
    const response = await fetch(`${endpoint}/${directory}?ref=${ebookBranch}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
    if (response.status === 404) return [];
    if (!response.ok) throw new Error("GitHub directory unavailable");
    const { entries } = await response.json();
    if (!Array.isArray(entries)) throw new Error("Invalid GitHub directory response");
    return entries.flatMap((entry) => {
      const book = entry.type === "file" ? uploadedBook(entry.name) : null;
      return book?.format === format ? [book] : [];
    });
  }));
  return lists.flat();
}

export async function commitEbook(book, bytes, token) {
  const url = `${endpoint}/${ebookDirectory[book.format]}/${encodeURIComponent(book.file)}`;
  const requestHeaders = authHeaders(token);
  const expectedSha = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  const body = JSON.stringify({
    branch: ebookBranch,
    message: `Add ebook: ${book.title}`,
    content: bytes.toString("base64"),
  });

  // Unrelated commits can race on the branch. Check for an existing file before retrying.
  for (let attempt = 0; attempt < 2; attempt++) {
    const saved = await fetch(url, {
      method: "PUT",
      headers: { ...requestHeaders, "Content-Type": "application/json" },
      body,
    });
    if (saved.status === 201) return true;
    if (saved.status !== 409 && saved.status !== 422) throw new Error(`GitHub commit failed (${saved.status})`);
    const existing = await fetch(`${url}?ref=${ebookBranch}`, { headers: requestHeaders, cache: "no-store" });
    if (existing.ok) return (await existing.json()).sha === expectedSha;
    if (saved.status !== 409 || existing.status !== 404) break;
  }
  throw new Error("GitHub menolak commit.");
}
