import { fetchUploadedBooks } from "../../../lib/github-ebooks.server";

export async function GET() {
  try {
    const books = await fetchUploadedBooks(process.env.GITHUB_TOKEN);
    return Response.json(books, { headers: { "Cache-Control": "public, max-age=0, s-maxage=15" } });
  } catch {
    return Response.json({ error: "Katalog unggahan belum bisa dimuat." }, { status: 502 });
  }
}
