import books from "./books.json";

export const categories = [
  { id: "architecture", label: "Arsitektur", color: "#e8e6f5" },
  { id: "data", label: "Sistem & Data", color: "#dcece6" },
  { id: "design", label: "Pola Desain", color: "#eee3f2" },
  { id: "quality", label: "Kualitas Kode", color: "#f4e6df" },
  { id: "testing", label: "Pengujian", color: "#e8ecf5" },
  { id: "modeling", label: "Pemodelan", color: "#e3edeb" },
  { id: "agile", label: "Agile", color: "#f6eadc" },
  { id: "foundations", label: "Dasar Pemrograman", color: "#e9e8e3" },
];

export const featuredIds = [
  "designing-data-intensive-applications",
  "clean-architecture",
  "domain-driven-design",
  "the-pragmatic-programmer",
];

export function findBook(id) {
  return books.find((book) => book.id === id);
}

export function coverUrl(book) {
  return `/covers/${book.id}.webp`;
}

export function bookUrl(book) {
  return `/baca/${book.id}`;
}

export { books };
