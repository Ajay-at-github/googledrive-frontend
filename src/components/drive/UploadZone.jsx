import React, { useState } from "react";
import { getUploadUrl } from "../../api/file.api";
import { createFile } from "../../api/file.api";

export default function UploadZone({ folderId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  const handleFileUpload = async (file) => {
    setError("");
    setUploading(true);

    try {
      // 1️⃣ Get pre-signed URL from backend (WITH folderId)
      const ownerId = getOwnerIdFromToken();
      if (!ownerId) {
        setError("Unable to determine user. Please log in again.");
        setUploading(false);
        return;
      }
      const payload = {
        fileName: file.name,
        fileType: file.type,
        folderId,
      };
      payload.ownerId = ownerId;

      const res = await getUploadUrl(payload);

      console.log("Upload URL response:", res.data);

      const { uploadUrl, fileKey } = res.data;

      // 2️⃣ Upload file directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!s3Res.ok) {
        const text = await s3Res.text();
        console.error("S3 upload failed:", s3Res.status, text);
        throw new Error("S3 upload failed");
      }

    // 3️⃣ Save file metadata to DB
    const savedFileRes = await createFile({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      s3Key: fileKey,
      folderId,
      path: folderId ? undefined : "root", // backend can derive too
    });

    // 4️⃣ Notify parent ONLY after DB save
    onUploadSuccess(savedFileRes.data);
    
  } catch (err) {
    console.error(err);
    setError("File upload failed");
  } finally {
    setUploading(false);
  }
};

const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput").click()}
        className="border-2 border-dashed border-gray-400 rounded p-6 text-center cursor-pointer bg-white hover:bg-gray-50"
      >
        <p className="text-gray-600">
          Drag & drop files here or click to upload
        </p>

        {uploading && (
          <p className="text-blue-600 mt-2">Uploading...</p>
        )}

        {error && (
          <p className="text-red-600 mt-2">{error}</p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        hidden
        onChange={(e) => {
          if (e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
