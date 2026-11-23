"use client";

import { useEffect, useRef, useState } from "react";
import { ebookFileUrl } from "../lib/ebook-file";
import { canLoadPdfByRange, pdfRangeOptions, preparePdfRange } from "../lib/pdf-range";

const pdfAssetPath = "/pdf-assets/";

function outlineEntries(items, prefix = "pdf") {
  return (items || []).flatMap((item, index) => {
    const key = `${prefix}-${index}`;
    const children = outlineEntries(item.items, key);
    if (!item.dest && !children.length) return [];
    return [{ key, label: item.title, target: item.dest, children }];
  });
}

export function usePdfReader(book, callbacks, navigation) {
  const [source, setSource] = useState(null);
  const { onError, onOutline, onPosition } = callbacks;
  const { controls, position, spread, getInitialPosition, outlineOpen } = navigation;
  const activePage = position?.page ?? 1;
  const fileUrl = ebookFileUrl(book);
  const fileSize = canLoadPdfByRange(book) ? book.fileSize : 0;

  useEffect(() => {
    if (book.format !== "pdf") return;
    let loading;
    let fallbackStarted = false;
    let cancelled = false;
    const rangeController = new AbortController();

    async function loadPdf(engine, input, rangeSignal) {
      if (cancelled) return;
      loading = engine.getDocument({
        ...input,
        isEvalSupported: false,
        cMapUrl: `${pdfAssetPath}cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${pdfAssetPath}standard_fonts/`,
        wasmUrl: `${pdfAssetPath}wasm/`,
        iccUrl: `${pdfAssetPath}iccs/`,
      });
      const pdf = await loading.promise;
      if (cancelled || rangeSignal?.aborted) return;
      const initialPage = Number(getInitialPosition()?.page) || 1;
      const page = Math.max(1, Math.min(pdf.numPages, initialPage));
      setSource({ pdf, engine, rangeSignal });
      onPosition({ page, total: pdf.numPages, percent: page / pdf.numPages * 100 });
    }

    function reportFailure(error) {
      if (cancelled) return;
      console.error(error);
      onError("PDF tidak bisa dibuka.");
    }

    async function loadFullPdf(engine) {
      if (cancelled || fallbackStarted) return;
      fallbackStarted = true;
      rangeController.abort();
      setSource(null);
      await loading?.destroy().catch(() => {});
      await loadPdf(engine, { url: fileUrl }).catch(reportFailure);
    }

    async function openPdf() {
      const [engine, initial] = await Promise.all([
        import("pdfjs-dist"),
        fileSize ? preparePdfRange(fileUrl, rangeController.signal).catch(() => null) : null,
      ]);
      if (cancelled) return;
      engine.GlobalWorkerOptions.workerSrc = `${pdfAssetPath}pdf.worker.min.mjs`;
      if (initial?.firstChunk) {
        const fallback = () => loadFullPdf(engine);
        const options = pdfRangeOptions(engine, fileUrl, fileSize, initial.firstChunk, rangeController, fallback);
        await loadPdf(engine, options, rangeController.signal).catch(fallback);
      } else {
        await loadPdf(engine, initial?.data ? { data: initial.data } : { url: fileUrl });
      }
    }

    openPdf().catch(reportFailure);
    return () => {
      cancelled = true;
      rangeController.abort();
      loading?.destroy().catch(() => {});
    };
  }, [book.format, fileUrl, fileSize, getInitialPosition, onError, onPosition]);

  useEffect(() => {
    if (!source || !outlineOpen) return;
    let cancelled = false;
    source.pdf.getOutline().then((items) => {
      if (!cancelled) onOutline(outlineEntries(items));
    }).catch(() => {
      if (!cancelled) onOutline([]);
    });
    return () => { cancelled = true; };
  }, [source, outlineOpen, onOutline]);

  useEffect(() => {
    if (!source) return;
    const { pdf } = source;
    const updatePage = (requested) => {
      const page = Math.max(1, Math.min(pdf.numPages, Math.trunc(requested)));
      if (!Number.isFinite(page) || activePage === page) return;
      onPosition({ page, total: pdf.numPages, percent: page / pdf.numPages * 100 });
    };
    controls.current = {
      next: () => updatePage(activePage + (spread ? 2 : 1)),
      previous: () => updatePage(activePage - (spread ? 2 : 1)),
      go: async (target) => {
        if (typeof target === "number") {
          updatePage(target);
        } else {
          const dest = typeof target === "string" ? await pdf.getDestination(target) : target;
          if (!dest?.length) return;
          const index = Number.isInteger(dest[0]) ? dest[0] : await pdf.getPageIndex(dest[0]);
          updatePage(index + 1);
        }
      },
    };
    return () => { controls.current = null; };
  }, [activePage, controls, onPosition, source, spread]);

  return source;
}

function PdfPage({ source, pageNumber, width, onError, onReady }) {
  const container = useRef(null);
  const canvas = useRef(null);
  const text = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (width <= 0) return;
    let drawing;
    let textLayer;
    let cancelled = false;
    const textElement = text.current;
    const canvasElement = canvas.current;

    async function renderPage() {
      try {
        const page = await source.pdf.getPage(pageNumber);
        if (cancelled) return;
        const original = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: width / original.width });
        const density = Math.min(window.devicePixelRatio || 1, 2);
        canvasElement.width = Math.ceil(viewport.width * density);
        canvasElement.height = Math.ceil(viewport.height * density);
        canvasElement.style.width = `${viewport.width}px`;
        canvasElement.style.height = `${viewport.height}px`;
        container.current.style.setProperty("--total-scale-factor", viewport.scale);
        drawing = page.render({
          canvas: canvasElement,
          viewport,
          transform: [density, 0, 0, density, 0, 0],
        });
        await drawing.promise;
        if (cancelled) return;
        setRendered(true);
        onReady?.();
        textElement.replaceChildren();
        textLayer = new source.engine.TextLayer({
          textContentSource: page.streamTextContent(),
          container: textElement,
          viewport,
        });
        await textLayer.render();
      } catch (error) {
        if (cancelled || source.rangeSignal?.aborted || error.name === "RenderingCancelledException" || error.name === "AbortException") return;
        console.error(error);
        if (!textLayer) onError(`Halaman ${pageNumber} tidak bisa ditampilkan.`);
      }
    }

    renderPage();
    return () => {
      cancelled = true;
      drawing?.cancel();
      textLayer?.cancel();
    };
  }, [onError, onReady, pageNumber, source, width]);

  return (
    <div className={`pdf-page${rendered ? " rendered" : ""}`} ref={container} style={{ width }}>
      <canvas ref={canvas} role="img" aria-label={`Halaman ${pageNumber}`} />
      <div className="textLayer" ref={text} />
    </div>
  );
}

export function PdfPages({ source, page, spread, width, onError, onPageReady, scrollArea }) {
  const scrollPosition = useRef(page);

  useEffect(() => {
    if (scrollPosition.current === page) return;
    scrollPosition.current = page;
    scrollArea.current?.scrollTo({ top: 0, left: 0 });
  }, [page, scrollArea]);

  const hasFacingPage = spread && page < source.pdf.numPages;
  return (
    <div className={`pdf-book${hasFacingPage ? " double-page" : ""}`} key={page}>
      <PdfPage source={source} pageNumber={page} width={width} onError={onError} onReady={onPageReady} />
      {hasFacingPage && <PdfPage source={source} pageNumber={page + 1} width={width} onError={onError} />}
    </div>
  );
}
