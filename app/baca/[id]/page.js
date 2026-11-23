import { notFound } from "next/navigation";
import Reader from "../../../components/reader";
import { books, findBook } from "../../../lib/catalog";

export function generateStaticParams() {
  return books.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = findBook(id);
  return book ? { title: book.title, description: book.description } : {};
}

export default async function ReadPage({ params }) {
  const { id } = await params;
  const book = findBook(id);
  if (!book) notFound();
  return <Reader key={id} book={book} />;
}
