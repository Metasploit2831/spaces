import { DraftPayload } from "../types/space";

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function payloadsFromPaste(event: ClipboardEvent): Promise<DraftPayload[]> {
  const clipboard = event.clipboardData;
  if (!clipboard) return [];
  const imageFiles = Array.from(clipboard.files).filter((file) => file.type.startsWith("image/"));
  if (imageFiles.length) {
    return Promise.all(
      imageFiles.map(async (file) => ({
        type: "screenshot" as const,
        src: await fileToDataUrl(file),
        fileName: file.name || "Clipboard screenshot",
        fileType: file.type,
        fileSize: file.size,
      })),
    );
  }
  const text = clipboard.getData("text/plain");
  return text ? [{ type: "text", content: text }] : [];
}
