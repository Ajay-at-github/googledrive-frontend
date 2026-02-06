import React from "react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DriveContent } from "../components/dashboard/DriveContent";
import {
  getFolders,
  createFolder,
  deleteFolder,
  downloadFolder,
} from "../api/folder.api";
import {
  deleteFile,
  getFiles,
  getDownloadUrl,
} from "../api/file.api";
import { isStarred, toggleStar } from "../utils/starredItems";
import { isTrashed, addToTrash } from "../utils/trashedItems";

export function Starred() {
  const outletContext = useOutletContext() || {};
  const viewMode = outletContext.viewMode || "list";

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const API_ENABLED = !!import.meta.env.VITE_API_BASE_URL;

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const res = await getFolders();
      setFolders(res.data);
    } catch (err) {
      if (!API_ENABLED) return;
      console.error("Failed to fetch folders", err);
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      const normalizedFiles = res.data
        .map((file) => ({
          ...file,
          name: file.name || file.fileName,
        }))
        .filter((file) => file._id && file.s3Key);
      setFiles(normalizedFiles);
    } catch (err) {
      if (!API_ENABLED) return;
      console.error("Failed to fetch files", err);
    }
  };

  // Normalize items
  const normalizeItem = (item, type) => ({
    ...item,
    type: type,
    id: item._id,
    starred: isStarred(item._id),
    trashed: isTrashed(item._id),
  });

  useEffect(() => {
    if (!API_ENABLED) return;
    fetchFolders();
    fetchFiles();
  }, []);

  // Combine folders and files, filter starred only
  useEffect(() => {
    const combined = [
      ...folders.map((f) => normalizeItem(f, "folder")),
      ...files.map((f) => normalizeItem(f, "file")),
    ]
      .filter((item) => item.starred && !item.trashed);
    setItems(combined);
  }, [folders, files]);

  const handleStar = (item) => {
    const targetId = item?._id || item?.id;
    if (!targetId) return;
    const nextStar = toggleStar(targetId);

    if (!nextStar) {
      setItems((prev) => prev.filter((entry) => entry.id !== targetId));
    } else {
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === targetId ? { ...entry, starred: nextStar } : entry
        )
      );
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      const res = await createFolder({
        name: folderName,
        parentFolderId: null,
      });
      const newFolder = res.data.folder;
      // Auto-star newly created folders in Starred view
      if (newFolder?._id) {
        const { addToStarred } = await import("../utils/starredItems");
        addToStarred(newFolder._id);
      }
      setFolders((prev) => [...prev, newFolder]);
    } catch (err) {
      console.error("Failed to create folder", err);
      alert("Failed to create folder");
    }
  };

  const handleUploadFile = (files) => {
    console.log("Files selected for upload:", files);
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await getDownloadUrl(file._id);
      const { downloadUrl, fileName } = res.data;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || file.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file");
    }
  };

  const handleDownloadFolder = async (folder) => {
    try {
      const res = await downloadFolder(folder._id);
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folder.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Folder download failed", err);
      alert("Failed to download folder");
    }
  };

  const handleDeleteFile = (fileId) => {
    addToTrash(fileId);
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
    setItems((prev) => prev.filter((item) => item.id !== fileId));
  };

  const handleDeleteFolder = (folderId) => {
    addToTrash(folderId);
    setFolders((prev) => prev.filter((f) => f._id !== folderId));
    setItems((prev) => prev.filter((item) => item.id !== folderId));
  };

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      console.log("Open folder:", item.name);
    } else {
      try {
        const res = await getDownloadUrl(item._id);
        const { downloadUrl } = res.data;
        window.open(downloadUrl, "_blank");
      } catch (err) {
        console.error("Failed to open file", err);
        alert("Failed to open file");
      }
    }
  };

  return (
    <DriveContent
      items={items}
      viewMode={viewMode}
      title="Starred"
      onStarItem={handleStar}
      onDownloadItem={() => {}}
      onTrashItem={() => {}}
      onItemClick={handleItemClick}
      onCreateFolder={handleCreateFolder}
      onUploadFile={handleUploadFile}
      onDownloadFile={handleDownloadFile}
      onDownloadFolder={handleDownloadFolder}
      onDeleteFile={handleDeleteFile}
      onDeleteFolder={handleDeleteFolder}
    />
  );
}
