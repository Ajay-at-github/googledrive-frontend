export const forceDownload = async ({ downloadUrl, fileName }) => {
  const response = await fetch(downloadUrl, { mode: "cors" });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  // Force download by using a generic binary MIME type.
  const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(downloadBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "download";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
