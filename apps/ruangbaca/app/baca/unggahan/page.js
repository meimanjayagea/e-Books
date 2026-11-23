"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import Reader from "../../../components/reader";
import { uploadedBook } from "../../../lib/github-uploads";

function UploadedReader() {
  const book = uploadedBook(useSearchParams().get("file"));
  if (book) return <Reader key={book.id} book={book} />;

  return (
    <main className="route-message">
      <section className="empty-state">
        <BookOpen size={24} />
        <h1>Buku tidak ditemukan</h1>
        <p>Pilih ebook dari koleksi unggahan untuk mulai membaca.</p>
        <Link className="primary-button" href="/">Kembali ke koleksi</Link>
      </section>
    </main>
  );
}

export default function UploadedReaderPage() {
  return (
    <Suspense fallback={<main className="route-message" role="status">Menyiapkan buku…</main>}>
      <UploadedReader />
    </Suspense>
  );
}
