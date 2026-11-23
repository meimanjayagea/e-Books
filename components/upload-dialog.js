"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, CloudUpload, FileText, KeyRound, LoaderCircle, X } from "lucide-react";
import { bookUrl } from "../lib/catalog";
import { titleFromPdf, uploadPdf, validatePdf } from "../lib/github-uploads";

export default function UploadDialog({ open, onClose, onUploaded }) {
  const dialog = useRef(null);
  const tokenField = useRef(null);
  const heading = useRef(null);
  const selection = useRef(0);
  const inProgress = useRef(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
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
    selection.current += 1;
    setFile(null);
    setTitle("");
    setError("");
    setResult(null);
    setDragging(false);
    if (tokenField.current) tokenField.current.value = "";
    onClose();
  }

  async function chooseFile(candidate) {
    if (!candidate || inProgress.current) return;
    const attempt = ++selection.current;
    setFile(null);
    setTitle("");
    setError("");
    try {
      await validatePdf(candidate);
      if (attempt !== selection.current) return;
      setFile(candidate);
      setTitle(titleFromPdf(candidate.name).slice(0, 100));
    } catch (failure) {
      if (attempt === selection.current) setError(failure.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!file || inProgress.current) return;
    inProgress.current = true;
    setBusy(true);
    setError("");
    const token = tokenField.current.value.trim();
    tokenField.current.value = "";
    try {
      const book = await uploadPdf({ file, title, token });
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
          <h2 ref={heading} id="upload-title" tabIndex={-1}>{result ? "PDF berhasil diunggah" : "Unggah PDF"}</h2>
          {result ? (
            <>
              <p className="upload-intro" role="status"><strong>{result.title}</strong> sudah tersedia di katalog dan repositori.</p>
              <div className="upload-footer">
                <button type="button" className="secondary-button" onClick={close}>Selesai</button>
                <Link className="primary-button" href={bookUrl(result)} onClick={close}><BookOpen size={18} /> Baca PDF</Link>
              </div>
            </>
          ) : (
            <>
              <p className="upload-intro">PDF akan muncul di katalog dan di repositori publik e-Books di GitHub.</p>
              <form className="upload-form" onSubmit={submit} aria-busy={busy}>
                <label
                  className={`file-drop${dragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}
                >
                  <input type="file" accept=".pdf,application/pdf" disabled={busy} onChange={(event) => { chooseFile(event.target.files[0]); event.target.value = ""; }} />
                  {file ? <FileText size={22} /> : <CloudUpload size={22} />}
                  <span><strong>{file ? file.name : "Pilih atau seret file PDF"}</strong><small>{file ? `${new Intl.NumberFormat("id", { maximumFractionDigits: 2 }).format(file.size / 1024 / 1024)} MB · Klik untuk mengganti` : "Maksimal 50 MB"}</small></span>
                </label>
                <label className="upload-field">
                  <span>Judul buku</span>
                  <input type="text" maxLength={100} value={title} placeholder="Judul yang ditampilkan di katalog" disabled={busy} required onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="upload-field">
                  <span>Token GitHub</span>
                  <input ref={tokenField} type="password" placeholder="github_pat_…" autoComplete="off" spellCheck={false} disabled={busy} required aria-describedby="token-help" />
                </label>
                <details className="token-help" id="token-help">
                  <summary><KeyRound size={15} /> Cara mendapatkan token GitHub</summary>
                  <p>Buat <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">fine-grained token</a>, pilih hanya repositori <strong>e-Books</strong>, lalu beri izin <strong>Contents: Read and write</strong>. Token dikirim langsung ke GitHub untuk unggahan ini.</p>
                </details>
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
