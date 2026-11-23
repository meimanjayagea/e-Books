"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, CloudUpload, FileText, LoaderCircle, X } from "lucide-react";
import { bookUrl } from "../lib/catalog";
import { titleFromFile } from "../lib/ebook-source";
import { uploadEbook, validateEbook } from "../lib/upload-ebook";

export default function UploadDialog({ open, onClose, onUploaded }) {
  const dialog = useRef(null);
  const passwordField = useRef(null);
  const heading = useRef(null);
  const inProgress = useRef(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [percentage, setPercentage] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);

  useEffect(() => {
    if (result) heading.current?.focus();
  }, [result]);

  function close() {
    if (inProgress.current) return;
    setFile(null);
    setTitle("");
    setError("");
    setResult(null);
    setDragging(false);
    if (passwordField.current) passwordField.current.value = "";
    onClose();
  }

  function chooseFile(candidate) {
    if (!candidate || inProgress.current) return;
    setFile(null);
    setTitle("");
    setError("");
    try {
      validateEbook(candidate);
      setFile(candidate);
      setTitle(titleFromFile(candidate.name).slice(0, 100));
    } catch (failure) {
      setError(failure.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!file || inProgress.current) return;
    inProgress.current = true;
    setBusy(true);
    setError("");
    setPercentage(null);
    const password = passwordField.current.value.trim();
    passwordField.current.value = "";
    try {
      const book = await uploadEbook({
        file, title, password,
        onUploadProgress: ({ percentage: current }) => setPercentage(Math.round(current)),
      });
      setResult(book);
      onUploaded(book);
    } catch (failure) {
      setError(failure.message);
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} className="upload-dialog" aria-labelledby="upload-title" onCancel={(event) => { event.preventDefault(); close(); }}>
      {open && (
        <div className="upload-inner">
          <button type="button" className="icon-button upload-close" aria-label="Tutup unggahan" disabled={busy} onClick={close}><X size={20} /></button>
          <div className="upload-symbol">{result ? <CheckCircle2 size={25} /> : <CloudUpload size={25} />}</div>
          <h2 ref={heading} id="upload-title" tabIndex={-1}>{result ? "Ebook berhasil diunggah" : "Unggah ebook"}</h2>
          {result ? (
            <>
              <p className="upload-intro" role="status"><strong>{result.title}</strong> sudah tersedia di katalog dan repositori.</p>
              <div className="upload-footer">
                <button type="button" className="secondary-button" onClick={close}>Selesai</button>
                <Link className="primary-button" href={bookUrl(result)} onClick={close}><BookOpen size={18} /> Baca ebook</Link>
              </div>
            </>
          ) : (
            <>
              <p className="upload-intro">PDF atau EPUB akan muncul di katalog dan di repositori publik e-Books di GitHub.</p>
              <form className="upload-form" onSubmit={submit} aria-busy={busy}>
                <label
                  className={`file-drop${dragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}
                >
                  <input type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" disabled={busy} onChange={(event) => { chooseFile(event.target.files[0]); event.target.value = ""; }} />
                  {file ? <FileText size={22} /> : <CloudUpload size={22} />}
                  <span><strong>{file ? file.name : "Pilih atau seret PDF atau EPUB"}</strong><small>{file ? `${new Intl.NumberFormat("id", { maximumFractionDigits: 2 }).format(file.size / 1024 / 1024)} MB · Klik untuk mengganti` : "Maksimal 50 MiB"}</small></span>
                </label>
                <label className="upload-field">
                  <span>Judul buku</span>
                  <input type="text" maxLength={100} value={title} placeholder="Judul yang ditampilkan di katalog" disabled={busy} required onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="upload-field">
                  <span>Kode admin</span>
                  <input ref={passwordField} type="password" autoComplete="current-password" spellCheck={false} disabled={busy} required />
                </label>
                {busy && <p role="status">{percentage === 100 ? "Menyimpan ke GitHub…" : percentage === null ? "Menyiapkan unggahan…" : `Mengunggah ${percentage}%…`}</p>}
                {error && <p className="upload-error" role="alert">{error}</p>}
                <div className="upload-footer">
                  <button type="button" className="secondary-button" disabled={busy} onClick={close}>Batal</button>
                  <button type="submit" className="primary-button" disabled={!file || busy}>{busy ? <LoaderCircle size={18} className="loading-icon" /> : <CloudUpload size={18} />}{busy ? "Mengunggah…" : "Unggah ke GitHub"}</button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
