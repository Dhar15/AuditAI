const MAX_PAGES = 60;
const MAX_CHARS = 50000;

/**
 * Extract plain text from a PDF File object using pdf.js loaded via CDN.
 * Reads up to MAX_PAGES pages or MAX_CHARS characters, whichever comes first.
 *
 * Requires index.html to include:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
 *
 * @param {File} file - PDF file from an <input type="file"> or drag-and-drop
 * @returns {Promise<string>} extracted text (truncated to MAX_CHARS)
 */
export function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib) {
      return reject(
        new Error("pdf.js not loaded — make sure the CDN script is in index.html")
      );
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        const pagesToRead = Math.min(pdf.numPages, MAX_PAGES);
        let text = "";

        for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";

          if (text.length > MAX_CHARS) break;
        }

        resolve(text.slice(0, MAX_CHARS));
      } catch (err) {
        reject(new Error(`Could not read PDF: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error("File could not be read by the browser."));
    reader.readAsArrayBuffer(file);
  });
}