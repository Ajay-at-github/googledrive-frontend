import { createFile, getUploadUrl } from "../api/file.api";

const getOwnerIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded.userId || decoded._id || decoded.sub || null;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

export const uploadFiles = async ({ files, folderId }) => {
  const ownerId = getOwnerIdFromToken();
  if (!ownerId) {
    throw new Error("Unable to determine user. Please log in again.");
  }

  const savedFiles = [];

  for (const file of files) {
    const payload = {
      fileName: file.name,
      fileType: file.type,
      folderId,
      ownerId,
    };

    const res = await getUploadUrl(payload);
    const { uploadUrl, fileKey } = res.data;

    const s3Res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!s3Res.ok) {
      const text = await s3Res.text();
      throw new Error(`S3 upload failed: ${s3Res.status} ${text}`);
    }

    const savedFileRes = await createFile({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      s3Key: fileKey,
      folderId,
      path: folderId ? undefined : "root",
    });

    const savedFile = savedFileRes.data?.file || savedFileRes.data;
    if (savedFile) {
      savedFiles.push(savedFile);
    }
  }

  return savedFiles;
};
