import { FileText } from "lucide-react";
import { coverUrl } from "../lib/catalog";

export default function BookCover({ book, eager = false }) {
  if (book.source === "github-upload") {
    return (
      <div className="generated-cover" aria-hidden="true">
        <FileText size={19} />
        <span>{book.title}</span>
      </div>
    );
  }

  return <img src={coverUrl(book)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />;
}
