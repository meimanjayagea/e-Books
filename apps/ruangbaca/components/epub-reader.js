"use client";

import { useEffect, useRef } from "react";
import { ebookFileUrl } from "../lib/ebook-file";

function tocEntries(items, prefix = "epub") {
  return (items || []).map((item, index) => {
    const key = `${prefix}-${index}`;
    return { key, label: item.label.trim() || "Bagian", target: item.href, children: tocEntries(item.subitems, key) };
  });
}

function safeChapter(document) {
  const head = document.querySelector("head");
  if (head) {
    const policy = document.createElementNS(head.namespaceURI, "meta");
    policy.setAttribute("http-equiv", "Content-Security-Policy");
    policy.setAttribute("content", "default-src 'none'; img-src blob: data:; style-src 'unsafe-inline' blob: data:; font-src blob: data:; media-src blob: data:; form-action 'none'");
    head.prepend(policy);
  }
  for (const element of document.querySelectorAll("iframe, frame, object, embed, script, meta[http-equiv='refresh' i]")) {
    element.remove();
  }
}

const epubTheme = {
  body: {
    "line-height": "1.55 !important",
    "overflow-wrap": "break-word",
  },
  "img, svg": {
    "max-width": "100% !important",
    "object-fit": "contain",
  },
};

function updateAppearance(rendition, { dark, scale, spread }) {
  rendition.themes.override("color", dark ? "#eae2d5" : "#24202a", true);
  rendition.themes.override("background-color", dark ? "#24222c" : "#fffdf8", true);
  rendition.themes.fontSize(`${Math.round(scale * 100)}%`);
  rendition.spread(spread ? "auto" : "none", 820);
}

export default function EpubReader({
  book, controls, appearance, getInitialPosition, onPosition, onOutline, onError, onKeyDown,
}) {
  const host = useRef(null);
  const engine = useRef(null);
  const latestAppearance = useRef(appearance);

  useEffect(() => {
    latestAppearance.current = appearance;
    if (engine.current) updateAppearance(engine.current, appearance);
  }, [appearance]);

  useEffect(() => {
    const element = host.current;
    const aborter = new AbortController();
    let epub;
    let rendition;
    let resize;
    let cancelled = false;
    let resizeTimer;
    let pending = Promise.resolve();

    function enqueue(task) {
      const result = pending.then(() => {
        if (!cancelled) return task();
      });
      pending = result.catch(() => {});
      return result;
    }

    function relocate(action) {
      return new Promise((resolve, reject) => {
        function finish(error) {
          clearTimeout(timeout);
          rendition.off("relocated", completed);
          rendition.off("displayError", finish);
          aborter.signal.removeEventListener("abort", completed);
          if (error) reject(error);
          else resolve();
        }
        const completed = () => finish();
        const timeout = setTimeout(() => finish(new Error("Lokasi EPUB tidak tersedia")), 10000);
        rendition.on("relocated", completed);
        rendition.on("displayError", finish);
        aborter.signal.addEventListener("abort", completed, { once: true });
        Promise.resolve().then(action).catch(finish);
      });
    }

    async function openEpub() {
      try {
        const [module, file] = await Promise.all([
          import("epubjs"),
          fetch(ebookFileUrl(book), { signal: aborter.signal }).then((response) => {
            if (!response.ok) throw new Error("EPUB download failed");
            return response.arrayBuffer();
          }),
        ]);
        if (cancelled) return;
        const createBook = typeof module.default === "function" ? module.default : module.default.default;
        epub = createBook();
        await epub.open(file, "binary");
        if (cancelled) return;

        epub.spine.hooks.content.register(safeChapter);
        let width = element.clientWidth;
        let height = element.clientHeight;
        rendition = epub.renderTo(element, {
          width,
          height,
          flow: "paginated",
          manager: "default",
          gap: 56,
          minSpreadWidth: 820,
          allowScriptedContent: false,
          allowPopups: false,
        });
        engine.current = rendition;
        rendition.themes.default(epubTheme);
        updateAppearance(rendition, latestAppearance.current);
        rendition.hooks.content.register((contents) => {
          const frame = contents.document.defaultView?.frameElement;
          if (frame) frame.title = `Isi buku ${book.title}`;
        });
        rendition.on("keydown", onKeyDown);
        const spine = epub.spine.spineItems;
        epub.loaded.navigation.then((loaded) => {
          if (cancelled) return;
          const navigation = tocEntries(loaded.toc);
          onOutline(navigation.length ? navigation : spine.map((section, index) => ({
            key: section.href,
            label: `Bagian ${index + 1}`,
            target: section.href,
            children: [],
          })));
        }).catch(() => {});

        rendition.on("relocated", ({ start, end, atStart, atEnd }) => {
          if (cancelled || !start?.cfi) return;
          const progressWithinSection = (end.displayed.page - 1) / Math.max(1, end.displayed.total);
          onPosition({
            cfi: start.cfi,
            href: start.href,
            section: start.index + 1,
            sections: spine.length,
            chapterPage: start.displayed.page,
            chapterTotal: start.displayed.total,
            percent: atEnd ? 100 : atStart ? 0 : (end.index + progressWithinSection) / spine.length * 100,
            atStart,
            atEnd,
          });
        });

        controls.current = {
          next: () => enqueue(() => {
            if (!rendition.location?.atEnd) return relocate(() => rendition.next());
          }),
          previous: () => enqueue(() => {
            if (!rendition.location?.atStart) return relocate(() => rendition.prev());
          }),
          go: (target) => enqueue(() => relocate(() => rendition.display(target))),
        };

        const initial = getInitialPosition()?.cfi;
        try {
          await enqueue(() => relocate(() => rendition.display(initial)));
        } catch (error) {
          if (!initial) throw error;
          await enqueue(() => relocate(() => rendition.display()));
        }
        if (cancelled) return;

        resize = new ResizeObserver(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            enqueue(() => {
              const nextWidth = element.clientWidth;
              const nextHeight = element.clientHeight;
              if (nextWidth > 0 && nextHeight > 0 && (width !== nextWidth || height !== nextHeight)) {
                width = nextWidth;
                height = nextHeight;
                return relocate(() => rendition.resize(width, height));
              }
            }).catch((error) => {
              if (!cancelled) console.warn(error);
            });
          }, 80);
        });
        resize.observe(element);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        onError("EPUB tidak bisa dibuka.");
      }
    }

    openEpub();
    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      resize?.disconnect();
      aborter.abort();
      controls.current = null;
      engine.current = null;
      epub?.destroy();
    };
  }, [book.id, book.title, controls, getInitialPosition, onError, onKeyDown, onOutline, onPosition]);

  return <div className={`epub-book${appearance.spread ? " epub-spread" : ""}`} ref={host} />;
}
