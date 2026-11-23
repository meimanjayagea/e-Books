import "@fontsource-variable/dm-sans";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata = {
  title: { default: "Ruang Baca · Perpustakaan Digital", template: "%s · Ruang Baca" },
  description: "Perpustakaan digital untuk membaca koleksi ebook teknologi dalam format PDF dan EPUB.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
