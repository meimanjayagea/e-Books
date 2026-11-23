"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, BookOpen, Bookmark, ChevronDown, CloudUpload, LibraryBig, Search, X } from "lucide-react";
import { books, bookUrl, categories, featuredIds, findBook } from "../lib/catalog";
import { listUploadedBooks } from "../lib/github-uploads";
import { toggleSaved, useReadingState } from "../lib/reading-state";
import BookCover from "./book-cover";
import UploadDialog from "./upload-dialog";

const featured = findBook(featuredIds[0]);
const orderedBooks = [
  ...featuredIds.map(findBook),
  ...books.filter((book) => !featuredIds.includes(book.id)),
];
const categoryLabels = Object.fromEntries(categories.map(({ id, label }) => [id, label]));
const sortOptions = [
  ["featured", "Rekomendasi"],
  ["title", "Judul A–Z"],
  ["recent", "Terakhir dibaca"],
];
const collator = new Intl.Collator("id");

function FeaturedBook({ book, hasProgress }) {
  const [left, right] = featuredIds.filter((id) => id !== book.id).slice(0, 2).map(findBook);
  return (
    <section className="feature" aria-labelledby="feature-heading">
      <div className="feature-copy">
        <h1 id="feature-heading">{hasProgress ? <>Lanjutkan <em>membaca.</em></> : <>Temukan bacaan <em>berikutnya.</em></>}</h1>
        <p>{hasProgress ? book.title : "Buku-buku pilihan tentang pemrograman, arsitektur, dan rekayasa perangkat lunak."}</p>
        <div className="feature-actions">
          <Link className="primary-button" href={bookUrl(book)}><BookOpen size={18} /> {hasProgress ? "Lanjutkan buku" : "Baca buku pilihan"}</Link>
          <a className="feature-browse" href="#koleksi">Jelajahi koleksi</a>
        </div>
      </div>
      <div className="feature-art" aria-hidden="true">
        <div className="hero-book hero-book-left"><BookCover book={left} eager /></div>
        <div className="hero-book hero-book-right"><BookCover book={right} eager /></div>
        <div className="hero-book hero-book-main"><BookCover book={book} eager /></div>
      </div>
    </section>
  );
}

function BookCard({ book, saved, progress, index }) {
  const category = categories.find(({ id }) => id === book.category);
  const percent = Math.max(0, Math.min(100, Math.round(progress?.percent || 0)));
  const href = bookUrl(book);

  return (
    <article className="book-card">
      <div className="book-display" style={{ "--book-tint": category.color }}>
        <Link href={href} className="book-display-link" aria-label={`Baca ${book.title}`}>
          <div className="book-jacket"><BookCover book={book} eager={index < 4} /></div>
        </Link>
        <span className={`format-tag format-${book.format}`}>{book.format.toUpperCase()}</span>
        <button
          type="button"
          className="save-button"
          aria-label={saved ? `Hapus ${book.title} dari Tersimpan` : `Simpan ${book.title}`}
          aria-pressed={saved}
          title={saved ? "Hapus dari Tersimpan" : "Simpan buku"}
          onClick={() => toggleSaved(book.id)}
        ><Bookmark size={18} /></button>
      </div>
      <div className="book-details">
        <div className="book-category">{category.label}</div>
        <h3><Link href={href}>{book.title}</Link></h3>
        {book.author && <p>{book.author}</p>}
        {progress && (
          <div className="card-progress">
            <progress aria-label={`Progres ${book.title}`} max={100} value={percent} />
            <span>{percent}%</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Library() {
  const { saved, progress } = useReadingState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("all");
  const [sort, setSort] = useState("featured");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const recentUploads = useRef(new Map());
  const search = useRef(null);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        search.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    listUploadedBooks(controller.signal).then((incoming) => {
      if (controller.signal.aborted) return;
      const available = new Map(incoming.map((book) => [book.id, book]));
      for (const [id, book] of recentUploads.current) {
        if (available.has(id)) recentUploads.current.delete(id);
        else available.set(id, book);
      }
      setUploads([...available.values()]);
      setUploadStatus("ready");
    }).catch(() => {
      if (!controller.signal.aborted) setUploadStatus("error");
    });
    return () => controller.abort();
  }, [loadAttempt]);

  const allBooks = [...orderedBooks, ...uploads];
  const lastRead = allBooks.filter((book) => progress[book.id])
    .sort((first, second) => progress[second.id].updated - progress[first.id].updated)[0];
  const term = query.trim().toLocaleLowerCase("id");
  const filtered = allBooks.filter((book) => (
    (view === "all" || saved.includes(book.id))
    && (category === "all" || book.category === category)
    && [book.title, book.author, book.format, categoryLabels[book.category]]
      .some((value) => value.toLocaleLowerCase("id").includes(term))
  ));

  if (sort === "title") filtered.sort((first, second) => collator.compare(first.title, second.title));
  if (sort === "recent") {
    filtered.sort((first, second) => (progress[second.id]?.updated ?? 0) - (progress[first.id]?.updated ?? 0));
  }

  function changeView(nextView) {
    setView(nextView);
    setCategory("all");
    setQuery("");
  }

  function addUpload(book) {
    recentUploads.current.set(book.id, book);
    setUploads((current) => current.some(({ id }) => id === book.id) ? current : [...current, book]);
    changeView("all");
    setCategory("uploads");
  }

  function retryUploads() {
    setUploadStatus("loading");
    setLoadAttempt((count) => count + 1);
  }

  const savedEmpty = view === "saved" && saved.length === 0;
  const uploadsEmpty = view === "all" && category === "uploads" && !term;
  const uploadStatusVisible = category === "uploads" && uploadStatus !== "ready";
  const heroVisible = view === "all" && !term && category !== "uploads";
  const CollectionHeading = heroVisible ? "h2" : "h1";

  return (
    <>
      <a className="skip-link" href="#koleksi">Langsung ke koleksi</a>
      <header className="library-header">
        <div className="header-inner page-width">
          <Link className="brand" href="/" onClick={() => changeView("all")}>
            <span className="brand-icon"><BookOpen size={22} strokeWidth={1.9} /></span>
            <span>Ruang<span className="brand-accent">Baca</span></span>
          </Link>
          <nav aria-label="Navigasi perpustakaan" className="library-nav">
            <button type="button" aria-pressed={view === "all"} onClick={() => changeView("all")}><LibraryBig size={18} /> Koleksi</button>
            <button type="button" aria-pressed={view === "saved"} onClick={() => changeView("saved")}><Bookmark size={18} /> Tersimpan</button>
          </nav>
          <button type="button" className="primary-button upload-trigger" onClick={() => setUploadOpen(true)}><CloudUpload size={19} /> Unggah PDF</button>
        </div>
      </header>
      <main className="page-width library-main">
        {heroVisible && <FeaturedBook book={lastRead ?? featured} hasProgress={Boolean(lastRead)} />}
        <section id="koleksi" className="collection" aria-labelledby="collection-heading" tabIndex={-1}>
          <div className="collection-top">
            <div className="collection-title">
              <CollectionHeading id="collection-heading">{view === "saved" ? "Buku tersimpan" : "Koleksi ebook"}</CollectionHeading>
              <p aria-live="polite">{filtered.length} ebook {term ? "ditemukan" : view === "saved" ? "tersimpan" : "tersedia"}</p>
            </div>
            <div className="collection-controls">
              <div className="search-box">
                <Search size={19} aria-hidden="true" />
                <input ref={search} type="search" placeholder="Cari judul atau penulis…" aria-label="Cari ebook" value={query}
                  onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} />
                {query ? <button type="button" aria-label="Hapus pencarian" onClick={() => { setQuery(""); search.current.focus(); }}><X size={17} /></button> : <kbd>Ctrl K</kbd>}
              </div>
              <div className="sort-control">
                <ArrowDownUp size={16} aria-hidden="true" />
                <select aria-label="Urutkan ebook" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {sortOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="category-bar" aria-label="Filter kategori" role="group">
            {[{ id: "all", label: "Semua buku" }, ...categories].map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>
            ))}
          </div>
          {uploadStatusVisible && (
            <div className="collection-notice" role="status">
              {uploadStatus === "loading" ? "Memuat unggahan dari GitHub…" : "Unggahan GitHub belum bisa dimuat."}
              {uploadStatus === "error" && <button className="secondary-button" type="button" onClick={retryUploads}>Coba lagi</button>}
            </div>
          )}
          {filtered.length > 0 ? (
            <div className="book-grid">
              {filtered.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} saved={saved.includes(book.id)} progress={progress[book.id]} />
              ))}
            </div>
          ) : !uploadStatusVisible && (
            <div className="empty-state">
              <span className="empty-symbol">{uploadsEmpty ? <CloudUpload size={25} /> : savedEmpty ? <Bookmark size={25} /> : <Search size={25} />}</span>
              <h3>{uploadsEmpty ? "Belum ada PDF yang diunggah" : savedEmpty ? "Belum ada buku tersimpan" : "Ebook tidak ditemukan"}</h3>
              <p>{uploadsEmpty ? "Tambahkan PDF untuk menampilkannya di koleksi." : savedEmpty
                ? "Tekan ikon penanda pada sampul untuk menyimpan buku."
                : "Coba kata kunci lain atau pilih kategori berbeda."}</p>
              <button type="button" className="secondary-button" onClick={uploadsEmpty ? () => setUploadOpen(true) : () => changeView(savedEmpty ? "all" : view)}>
                {uploadsEmpty ? "Unggah PDF" : savedEmpty ? "Jelajahi koleksi" : "Reset filter"}
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="library-footer"><div className="page-width"><BookOpen size={17} /> RuangBaca <a href="https://github.com/meimanjayagea/e-Books" target="_blank" rel="noopener noreferrer">Repositori GitHub</a></div></footer>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={addUpload} />
    </>
  );
}
