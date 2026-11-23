const rangeChunkSize = 512 * 1024;

export function canLoadPdfByRange(book) {
  return book.format === "pdf" && Number.isSafeInteger(book.fileSize) && book.fileSize >= 4 * 1024 * 1024;
}

function fetchRange(url, begin, end, signal) {
  return fetch(url, {
    headers: { Range: `bytes=${begin}-${end - 1}` },
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
  });
}

async function readRange(response, expectedLength) {
  if (response.status !== 206) {
    await response.body?.cancel();
    throw new Error(`PDF byte range returned HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length !== expectedLength) throw new Error("Unexpected PDF byte range length");
  return bytes;
}

export async function preparePdfRange(url, signal) {
  const response = await fetchRange(url, 0, rangeChunkSize, signal);
  if (response.status === 200) return { data: await response.arrayBuffer() };
  return { firstChunk: await readRange(response, rangeChunkSize) };
}

export function pdfRangeOptions(engine, url, fileSize, firstChunk, controller, onFailure) {
  const range = new engine.PDFDataRangeTransport(fileSize, firstChunk, true);
  range.requestDataRange = async (begin, end) => {
    try {
      const response = await fetchRange(url, begin, end, controller.signal);
      const chunk = await readRange(response, end - begin);
      if (!controller.signal.aborted) range.onDataRange(begin, chunk);
    } catch (error) {
      if (!controller.signal.aborted) onFailure(error);
    }
  };
  range.abort = () => controller.abort();
  return { range, rangeChunkSize, disableStream: true, disableAutoFetch: true };
}
