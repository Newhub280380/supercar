export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadText(
  content: string,
  filename: string,
  mimeType: string,
): void {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

export function withExtension(filename: string, extension: string): string {
  return filename.endsWith(`.${extension}`)
    ? filename
    : `${filename}.${extension}`;
}

export function printHtml(html: string, fallbackFilename: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    downloadText(
      html,
      withExtension(fallbackFilename, "html"),
      "text/html;charset=utf-8;",
    );
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}
