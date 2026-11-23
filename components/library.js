"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp, ArrowRight, BookOpen, Bookmark, ChevronDown, LibraryBig, Search, X,
} from "lucide-react";
import { books, bookUrl, categories, coverUrl, featuredIds, findBook } from "../lib/catalog";
import { toggleSaved, useReadingState } from "../lib/reading-state";

const featured = findBook(featuredIds[0]);
const orderedBooks = [
  ...featuredIds.map(findBook),
  ...books.filter((book) => !featuredIds.includes(book.id)),
];
const sortOptions = [
  ["featured", "Rekomendasi"],
  ["title", "Judul A–Z"],
  ["recent", "Terakhir dibaca"],
];
const collator = new Intl.Collator("id");

function Cover({ book, className = "", eager = false }) {
  return (
    <img
      className={className}
      src={coverUrl(book)}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function FeaturedBook({ book, hasProgress }) {
  const [left, right] = featuredIds.filter((id) => id !== book.id).slice(0, 2).map(findBook);
  return (
    <section className="feature" aria-labelledby="feature-heading">
      <div className="feature-copy">
        <div className="feature-kicker"><span /> {hasProgress ? "Bacaan terakhir" : "Pilihan koleksi"}</div>
        <h1 id="feature-heading">{hasProgress ? "Lanjutkan membaca" : <>Temukan bacaan<br /><em>berikutnya.</em></>}</h1>
        <p>
          {hasProgress
            ? book.title
            : "Jelajahi koleksi buku tentang rekayasa perangkat lunak, arsitektur, dan pemrograman."}
        </p>
        <Link className="feature-action" href={bookUrl(book)}>
          <BookOpen size={17} />
          {hasProgress ? "Lanjutkan buku" : "Baca buku pilihan"}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="feature-art" aria-hidden="true">
        <div className="feature-orbit orbit-one" />
        <div className="feature-orbit orbit-two" />
        <div className="feature-orbit orbit-three" />
        <span className="feature-star star-one">✦</span>
        <span className="feature-star star-two">✦</span>
        <span className="feature-star star-three">✧</span>
        <div className="hero-book hero-book-left"><Cover book={left} eager /></div>
        <div className="hero-book hero-book-right"><Cover book={right} eager /></div>
        <div className="hero-book hero-book-main"><Cover book={book} eager /></div>
      </div>
    </section>
  );
}

function BookCard({ book, saved, progress, index }) {
  const category = categories.find(({ id }) => id === book.category);
  const percent = Math.max(0, Math.min(100, Math.round(progress?.percent || 0)));

  return (
    <article className="book-card">
      <div className="book-display" style={{ "--book-tint": category.color }}>
        <Link href={bookUrl(book)} className="book-display-link" aria-label={`Baca ${book.title}`}>
          <div className="book-jacket"><Cover book={book} eager={index < 4} /></div>
          <span className="book-open"><BookOpen size={16} /> {progress ? "Lanjutkan" : "Baca buku"}</span>
        </Link>
        <span className={`format-tag format-${book.format}`}>{book.format.toUpperCase()}</span>
        <button
          type="button"
          className={`save-button${saved ? " is-saved" : ""}`}
          aria-label={saved ? `Hapus ${book.title} dari Tersimpan` : `Simpan ${book.title}`}
          aria-pressed={saved}
          onClick={() => toggleSaved(book.id)}
        >
          <Bookmark size={17} />
        </button>
      </div>
      <div className="book-details">
        <div className="book-category">{category.label}</div>
        <h3><Link href={bookUrl(book)}>{book.title}</Link></h3>
        <p>{book.author}</p>
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
  const search = useRef(null);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        search.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const lastRead = Object.entries(progress)
    .filter(([id, position]) => position && findBook(id))
    .sort(([, first], [, second]) => second.updated - first.updated)[0];
  const feature = lastRead ? findBook(lastRead[0]) : featured;
  const term = query.trim().toLocaleLowerCase("id");
  const filtered = orderedBooks.filter((book) => (
    (view === "all" || saved.includes(book.id))
    && (category === "all" || book.category === category)
    && [book.title, book.author, book.format, categories.find(({ id }) => id === book.category).label]
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

  return (
    <>
      <a className="skip-link" href="#koleksi">Langsung ke koleksi</a>
      <header className="library-header">
        <div className="header-inner page-width">
          <Link className="brand" href="/" onClick={() => changeView("all")}>
            <span className="brand-icon"><BookOpen size={22} strokeWidth={2.15} /></span>
            <span>Ruang<span className="brand-accent">Baca</span></span>
          </Link>
          <nav aria-label="Navigasi perpustakaan" className="library-nav">
            <button type="button" aria-pressed={view === "all"} onClick={() => changeView("all")}><LibraryBig size={17} /> Koleksi</button>
            <button type="button" aria-pressed={view === "saved"} onClick={() => changeView("saved")}><Bookmark size={17} /> Tersimpan</button>
          </nav>
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              ref={search}
              type="search"
              placeholder="Cari judul atau penulis..."
              aria-label="Cari ebook"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }}
            />
            {query ? (
              <button type="button" aria-label="Hapus pencarian" onClick={() => { setQuery(""); search.current.focus(); }}><X size={16} /></button>
            ) : <kbd>Ctrl K</kbd>}
          </div>
        </div>
      </header>
      <main className="page-width library-main">
        {view === "all" && !term && <FeaturedBook book={feature} hasProgress={Boolean(lastRead)} />}
        <section id="koleksi" className="collection" aria-labelledby="collection-heading">
          <div className="collection-top">
            <div>
              <h2 id="collection-heading">{view === "saved" ? "Buku tersimpan" : "Koleksi ebook"}</h2>
              <p aria-live="polite">{filtered.length} ebook {term ? "ditemukan" : view === "saved" ? "tersimpan" : "tersedia"}</p>
            </div>
            <div className="sort-control">
              <ArrowDownUp size={16} aria-hidden="true" />
              <select aria-label="Urutkan ebook" value={sort} onChange={(event) => setSort(event.target.value)}>
                {sortOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </div>
          </div>
          <div className="category-bar" aria-label="Filter kategori" role="group">
            {[{ id: "all", label: "Semua buku" }, ...categories].map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>
                {label}
              </button>
            ))}
          </div>
          {filtered.length > 0 ? (
            <div className="book-grid">
              {filtered.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} saved={saved.includes(book.id)} progress={progress[book.id]} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {view === "saved" && saved.length === 0 ? <Bookmark size={26} /> : <Search size={26} />}
              <h3>{view === "saved" && saved.length === 0 ? "Belum ada buku tersimpan" : "Ebook tidak ditemukan"}</h3>
              <p>{view === "saved" && saved.length === 0
                ? "Tekan ikon bookmark pada sampul untuk menyimpan buku."
                : "Coba kata kunci lain atau pilih kategori berbeda."}</p>
              <button type="button" className="secondary-button" onClick={() => changeView(view === "saved" && saved.length ? "saved" : "all")}>
                {view === "saved" && saved.length === 0 ? "Jelajahi koleksi" : "Reset filter"}
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="library-footer"><div className="page-width"><BookOpen size={17} /> RuangBaca <span>Perpustakaan digital</span></div></footer>
    </>
  );
}
