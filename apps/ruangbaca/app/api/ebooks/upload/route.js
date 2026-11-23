import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { del, get } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { ebookContentType, maxEbookSize, titleFromFile } from "../../../../lib/ebook-source";
import { commitEbook } from "../../../../lib/github-ebooks.server";
import { uploadedBook } from "../../../../lib/github-uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

const fail = (error, status) => Response.json({ error }, { status });
const digest = (input) => createHash("sha256").update(input).digest();
const stage = /^staging\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.(pdf|epub)$/;

function validContent(bytes, format) {
  if (format === "pdf") return bytes.subarray(0, 1024).includes("%PDF-");

  // EPUB requires the first ZIP entry to be the uncompressed mimetype marker.
  if (bytes.length < 58 || bytes.readUInt32LE(0) !== 0x04034b50
    || bytes.readUInt16LE(8) !== 0 || bytes.readUInt16LE(26) !== 8 || bytes.readUInt16LE(28) !== 0) return false;
  return bytes.subarray(30, 58).toString("ascii") === "mimetypeapplication/epub+zip";
}

export async function POST(request) {
  const { GITHUB_TOKEN, EBOOK_UPLOAD_PASSWORD, BLOB_READ_WRITE_TOKEN } = process.env;
  if (!GITHUB_TOKEN || !EBOOK_UPLOAD_PASSWORD || !BLOB_READ_WRITE_TOKEN) {
    return fail("Fitur unggah belum diaktifkan oleh admin.", 503);
  }
  const supplied = request.headers.get("authorization") ?? "";
  if (!timingSafeEqual(digest(supplied), digest(`Bearer ${EBOOK_UPLOAD_PASSWORD}`))) {
    return fail("Kode admin tidak valid.", 401);
  }

  const body = await request.json().catch(() => null);
  const format = body?.format;
  if (!["pdf", "epub"].includes(format) || typeof body.title !== "string" || body.title.length > 100) {
    return fail("Isi judul dan pilih PDF atau EPUB.", 400);
  }
  const name = titleFromFile(body.title.normalize("NFC").trim());
  const book = name && uploadedBook(`${name}.${format}`);
  if (!book) return fail("Judul tidak valid atau sudah dipakai di katalog.", 400);

  try {
    if (body.action === "prepare") {
      const pathname = `staging/${randomUUID()}.${format}`;
      const token = await generateClientTokenFromReadWriteToken({
        token: BLOB_READ_WRITE_TOKEN,
        pathname,
        maximumSizeInBytes: maxEbookSize,
        allowedContentTypes: [ebookContentType[format]],
        validUntil: Date.now() + 15 * 60 * 1000,
        addRandomSuffix: false,
        allowOverwrite: false,
        ttlDays: 1,
      });
      return Response.json({ pathname, token });
    }
    if (body.action !== "commit" || typeof body.pathname !== "string" || stage.exec(body.pathname)?.[1] !== format) {
      return fail("Referensi unggahan tidak valid.", 400);
    }

    const staged = await get(body.pathname, { access: "private", useCache: false });
    if (!staged?.stream) return fail("File unggahan tidak ditemukan. Unggah ulang file.", 404);
    if (staged.blob.size < 1 || staged.blob.size > maxEbookSize) {
      await staged.stream.cancel();
      await del(staged.blob.url).catch(() => {});
      return fail("Ukuran maksimal ebook 50 MiB.", 413);
    }
    const bytes = Buffer.from(await new Response(staged.stream).arrayBuffer());
    if (!validContent(bytes, format)) {
      await del(staged.blob.url).catch(() => {});
      return fail("Isi file tidak sesuai format yang dipilih.", 415);
    }
    const saved = await commitEbook(book, bytes, GITHUB_TOKEN);
    await del(staged.blob.url).catch(() => {});
    return saved ? Response.json(book, { status: 201 }) : fail("Judul ini sudah ada. Pilih judul lain.", 409);
  } catch (error) {
    console.error("Ebook upload failed", error instanceof Error ? error.name : "Unknown error");
    return fail("Unggah belum bisa diselesaikan. Periksa katalog sebelum mencoba lagi.", 502);
  }
}
