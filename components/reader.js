"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BookOpen, Bookmark, ChevronLeft, ChevronRight, CircleAlert, Columns2,
  Download, List, LoaderCircle, Minus, Moon, Plus, Sun, X,
} from "lucide-react";
import { categories, coverUrl } from "../lib/catalog";
import { ebookFileUrl } from "../lib/ebook-file";
import { getProgress, saveProgress, toggleSaved, useReadingState } from "../lib/reading-state";
import EpubReader from "./epub-reader";
import { PdfPages, usePdfReader } from "./pdf-reader";

const initialAppearance = { dark: false, scale: 1, spread: false };

function Tool({ label, pressed, children, ...props }) {
  return (
    <button type="button" className="reader-tool" aria-label={label} title={label} aria-pressed={pressed} {...props}>
      {children}
    </button>
  );
}

function Contents({ entries, go, currentHref }) {
  return (
    <ul className="contents-list">
      {entries.map(({ key, label, target, children }) => (
        <li key={key}>
          {target ? (
            <button
              type="button"
              onClick={() => go(target)}
              aria-current={currentHref && target === currentHref ? "location" : undefined}
            >
              {label}
            </button>
          ) : <span>{label}</span>}
          {children?.length > 0 && <Contents entries={children} go={go} currentHref={currentHref} />}
        </li>
      ))}
    </ul>
  );
}

function SidePanel({ book, category, outline, position, show, close, go }) {
  return (
    <aside className={`reader-sidebar${show ? " open" : ""}`} aria-label="Informasi dan daftar isi">
      <div className="sidebar-mobile-top"><span>Informasi buku</span><Tool label="Tutup daftar isi" onClick={close}><X size={20} /></Tool></div>
      <div className="sidebar-book">
        <img src={coverUrl(book)} alt="" />
        <div>
          <span>{category.label}</span>
          <strong>{book.title}</strong>
          <p>{book.author}</p>
        </div>
      </div>
      <div className="sidebar-outline">
        <h2><List size={17} /> Daftar isi</h2>
        {outline === null ? <p>Memuat daftar isi…</p> : outline.length ? (
          <Contents entries={outline} go={go} currentHref={position?.href} />
        ) : <p>File ini tidak menyediakan daftar isi. Gunakan navigasi halaman untuk berpindah bagian.</p>}
      </div>
    </aside>
  );
}

function NavigationBar({ position, pdf, spread, busy, navigate }) {
  const [pageInput, setPageInput] = useState(null);
  const page = position?.page;
  const atStart = pdf ? page <= 1 : position?.atStart;
  const atEnd = pdf ? page + (spread ? 1 : 0) >= position?.total : position?.atEnd;
  const percent = Math.max(0, Math.min(100, Math.round(position?.percent || 0)));
  const label = position ? pdf ? `Halaman ${page} dari ${position.total}`
    : `Bagian ${position.section} dari ${position.sections}, halaman ${position.chapterPage} dari ${position.chapterTotal}`
    : "Menyiapkan buku";

  function jump(event) {
    event.preventDefault();
    if (pageInput?.trim()) navigate("go", Number(pageInput));
    setPageInput(null);
  }

  return (
    <footer className="reader-footer">
      <div className="reader-progress" role="progressbar" aria-label="Progres baca" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="reader-bottom-inner">
        <button type="button" className="page-arrow" aria-label="Halaman sebelumnya" disabled={busy || !position || atStart} onClick={() => navigate("previous")}>
          <ChevronLeft size={19} /> <span>Sebelumnya</span>
        </button>
        <div className="page-status" aria-live="polite">
          {pdf && position ? (
            <form onSubmit={jump} className="page-jump">
              <label htmlFor="page-number">Hal.</label>
              <input
                id="page-number"
                aria-label="Lompat ke halaman"
                inputMode="numeric"
                maxLength={String(position.total).length}
                value={pageInput ?? page}
                onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ""))}
                onBlur={() => setPageInput(null)}
                onFocus={(event) => event.currentTarget.select()}
                title="Masukkan nomor halaman, lalu tekan Enter"
              />
              <span>/ {position.total}</span>
            </form>
          ) : <span title={label}>{position ? `Bagian ${position.section} / ${position.sections}` : "Memuat…"}</span>}
          <span className="page-divider" aria-hidden="true" />
          <span>{percent}%</span>
        </div>
        <button type="button" className="page-arrow" aria-label="Halaman berikutnya" disabled={busy || !position || atEnd} onClick={() => navigate("next")}>
          <span>Berikutnya</span> <ChevronRight size={19} />
        </button>
      </div>
    </footer>
  );
}

export default function Reader({ book }) {
  const { saved } = useReadingState();
  const [appearance, setAppearance] = useState(initialAppearance);
  const [position, setPosition] = useState(null);
  const [outline, setOutline] = useState(null);
  const [failure, setFailure] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasArea = useRef(null);
  const controls = useRef(null);
  const navigating = useRef(false);
  const pdf = book.format === "pdf";
  const canSpread = canvasSize.width >= (pdf ? 760 : 868);
  const spread = appearance.spread && canSpread;
  const category = categories.find(({ id }) => id === book.category);
  const isSaved = saved.includes(book.id);

  const onPosition = useCallback((nextPosition) => {
    setPosition(nextPosition);
    saveProgress(book.id, nextPosition);
  }, [book.id]);

  const getInitialPosition = useCallback(() => getProgress(book.id), [book.id]);
  const epubAppearance = useMemo(() => ({ ...appearance, spread }), [appearance, spread]);
  const source = usePdfReader(book, { onPosition, onError: setFailure, onOutline: setOutline }, {
    position, spread, controls, getInitialPosition,
  });

  useEffect(() => {
    const element = canvasArea.current;
    const measure = () => setCanvasSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const navigate = useCallback(async (direction, target) => {
    if (!controls.current || navigating.current) return;
    navigating.current = true;
    setBusy(true);
    setNotice("");
    try {
      await controls.current[direction](target);
    } catch (error) {
      console.error(error);
      setNotice("Bagian ini tidak bisa dibuka. Pilih halaman atau bagian lain.");
    } finally {
      navigating.current = false;
      setBusy(false);
    }
  }, []);

  const handleKeys = useCallback((event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey
      || event.target?.closest?.("input, select, textarea, [contenteditable]")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(event.key === "ArrowRight" ? "next" : "previous");
    }
    if (event.key === "Escape") setSidebar(false);
  }, [navigate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [handleKeys]);

  const gutter = canvasSize.width < 600 ? 28 : 76;
  const maxPageWidth = (canvasSize.width - gutter) / (spread ? 2 : 1);
  const fitWidth = canvasSize.width < 600
    ? maxPageWidth
    : Math.min(maxPageWidth, Math.max(330, (canvasSize.height - 62) * 0.75), 710);
  const pageWidth = Math.max(0, Math.round(fitWidth * appearance.scale));

  function adjustScale(amount) {
    setAppearance((current) => ({ ...current, scale: Math.round((current.scale + amount) * 10) / 10 }));
  }

  return (
    <div className={`reader-shell${appearance.dark ? " dark-reader" : ""}`}>
      <header className="reader-header">
        <Link className="reader-back" href="/" aria-label="Kembali ke koleksi"><ArrowLeft size={19} /><span>Koleksi</span></Link>
        <div className="reader-book-title">
          <span className={`format-tag format-${book.format}`}>{book.format.toUpperCase()}</span>
          <h1 title={book.title}>{book.title}</h1>
        </div>
        <div className="reader-tools" aria-label="Pengaturan baca" role="group">
          <Tool label="Daftar isi" pressed={sidebar} onClick={() => setSidebar(!sidebar)}><List size={20} /></Tool>
          <Tool label="Perkecil" disabled={appearance.scale <= 0.7} onClick={() => adjustScale(-0.1)}><Minus size={18} /></Tool>
          <span className="zoom-value" aria-live="polite">{Math.round(appearance.scale * 100)}%</span>
          <Tool label="Perbesar" disabled={appearance.scale >= 1.8} onClick={() => adjustScale(0.1)}><Plus size={18} /></Tool>
          <Tool label="Tampilan dua halaman" pressed={spread} disabled={!canSpread} className="reader-tool spread-tool" onClick={() => setAppearance({ ...appearance, spread: !appearance.spread })}><Columns2 size={18} /></Tool>
          <Tool label={appearance.dark ? "Mode terang" : "Mode gelap"} pressed={appearance.dark} onClick={() => setAppearance({ ...appearance, dark: !appearance.dark })}>{appearance.dark ? <Sun size={19} /> : <Moon size={18} />}</Tool>
          <Tool label={isSaved ? "Hapus dari Tersimpan" : "Simpan buku"} pressed={isSaved} className="reader-tool reader-bookmark" onClick={() => toggleSaved(book.id)}><Bookmark size={18} /></Tool>
        </div>
      </header>
      <div className="reader-body">
        {sidebar && <button type="button" className="sidebar-backdrop" aria-label="Tutup daftar isi" onClick={() => setSidebar(false)} />}
        <SidePanel book={book} category={category} outline={outline} position={position} show={sidebar}
          close={() => setSidebar(false)}
          go={(target) => { navigate("go", target); if (window.matchMedia("(max-width: 800px)").matches) setSidebar(false); }}
        />
        <main className={`reader-stage${pdf ? " pdf-stage" : " epub-stage"}`} aria-label="Halaman buku" ref={canvasArea}>
          {pdf
            ? source && !failure && <PdfPages source={source} page={position?.page ?? 1} spread={spread} width={pageWidth} onError={setFailure} scrollArea={canvasArea} />
            : !failure && <EpubReader book={book} controls={controls} appearance={epubAppearance} getInitialPosition={getInitialPosition}
                onPosition={onPosition} onOutline={setOutline} onError={setFailure} onKeyDown={handleKeys} />}
          {!position && !failure && <div className="reader-message" role="status"><LoaderCircle className="loading-icon" size={28} /> Memuat ebook…</div>}
          {failure && (
            <div className="reader-message" role="alert">
              <CircleAlert size={27} />
              <strong>{failure}</strong>
              <div>
                <button type="button" className="secondary-button" onClick={() => window.location.reload()}>Coba lagi</button>
                <a className="secondary-button" href={ebookFileUrl(book)} target="_blank" rel="noopener noreferrer"><Download size={16} /> Buka file ebook</a>
              </div>
            </div>
          )}
          {notice && <p className="reader-notice" role="alert">{notice}</p>}
          {position && !failure && epubAppearance.spread && !pdf && <span className="epub-gutter" aria-hidden="true" />}
        </main>
      </div>
      <NavigationBar position={position} pdf={pdf} spread={spread} busy={busy || Boolean(failure)} navigate={navigate} />
    </div>
  );
}
