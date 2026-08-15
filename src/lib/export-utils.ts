import { downloadText, withExtension } from "./download";

export function exportAsTXT(content: string, filename: string): void {
  downloadText(content, withExtension(filename, "txt"), "text/plain;charset=utf-8");
}

export function exportAsHTML(content: string, filename: string): void {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>${filename}</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333}h1,h2,h3{color:#1a1a1a}ul{padding-left:20px}li{margin-bottom:4px}</style>
</head>
<body>${markdownToHTML(content)}</body>
</html>`;
  downloadText(html, withExtension(filename, "html"), "text/html;charset=utf-8");
}

function markdownToHTML(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hulp])/gm, (match) => (match ? `<p>${match}` : ""))
    .replace(/^<p><\/p>$/gm, "");
}

export function getWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function getCharCount(text: string): number {
  return text.length;
}
