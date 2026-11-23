const source = "https://raw.githubusercontent.com/meimanjayagea/e-Books/d5594cea78b9af2768550bba70cebe67e7c1fcda";

export function ebookFileUrl({ file }) {
  return `${source}/${encodeURIComponent(file)}`;
}
