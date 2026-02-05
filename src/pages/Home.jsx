import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DriveContent } from "../components/dashboard/DriveContent";
import Breadcrumbs from "../components/drive/Breadcrumbs";
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
import { uploadFiles } from "../utils/uploadFiles";
import { isStarred, toggleStar, getStarredIds } from "../utils/starredItems";
import { isTrashed, addToTrash } from "../utils/trashedItems";

export function Home() {
  const outletContext = useOutletContext() || {};
  const viewMode = outletContext.viewMode || "list";

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const res = await getFolders();
      setFolders(res.data);
    } catch (err) {
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
      console.error("Failed to fetch files", err);
    }
  };

  // Combine folders and files, sort by recent
  const normalizeItem = (item, type) => ({
    ...item,
    type: type,
    id: item._id,
    starred: isStarred(item._id),
    trashed: isTrashed(item._id),
  });

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  const normalizeFile = (file) => ({
    ...file,
    name: file.name || file.fileName,
  });

  const isInCurrentFolder = (item) => {
    if (!currentFolder) {
      if (item.type === "folder") {
        return item.parentFolderId === null || item.parentFolderId === undefined;
      }
      return item.folderId === null || item.folderId === undefined;
    }
    const currentFolderId = currentFolder?._id || currentFolder?.id || null;
    if (item.type === "folder") {
      const parentId = item.parentFolderId ? String(item.parentFolderId) : null;
      return parentId === String(currentFolderId);
    }
    return String(item.folderId || "") === String(currentFolderId || "");
  };

  useEffect(() => {
    const combined = [
      ...folders.map((f) => normalizeItem(f, "folder")),
      ...files.map((f) => normalizeItem(f, "file")),
    ].filter((item) => !item.trashed);

    if (currentFolder) {
      setItems(combined.filter(isInCurrentFolder));
      return;
    }

    const rootItems = combined
      .filter(isInCurrentFolder)
      .sort(
        (a, b) =>
          new Date(b.modifiedAt || b.createdAt || Date.now()) -
          new Date(a.modifiedAt || a.createdAt || Date.now())
      );
    setItems(rootItems);
  }, [folders, files, currentFolder]);

  const handleStar = (item) => {
    const targetId = item?._id || item?.id;
    if (!targetId) return;
    const nextStar = toggleStar(targetId);

    setItems((prev) =>
      prev.map((entry) =>
        entry.id === targetId ? { ...entry, starred: nextStar } : entry
      )
    );
  };

  const handleCreateFolder = async (folderName) => {
    try {
      const parentFolderId = currentFolder?._id || currentFolder?.id || null;
      const res = await createFolder({
        name: folderName,
        parentFolderId,
      });
      setFolders((prev) => [...prev, res.data.folder]);
    } catch (err) {
      console.error("Failed to create folder", err);
      alert("Failed to create folder");
    }
  };

  const handleUploadFile = async (fileList) => {
    try {
      const folderId = currentFolder?._id || currentFolder?.id || null;
      const uploaded = await uploadFiles({
        files: Array.from(fileList),
        folderId,
      });
      const normalized = uploaded.map(normalizeFile);
      setFiles((prev) => [...prev, ...normalized]);
    } catch (err) {
      console.error("File upload failed", err);
      alert(err.message || "File upload failed");
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await getDownloadUrl(file._id);
      const { downloadUrl, fileName } = res.data;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      setCurrentFolder(item);
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

  const breadcrumbs = useMemo(
    () => (
      <Breadcrumbs
        folder={currentFolder}
        folders={folders}
        onNavigate={(folder) => setCurrentFolder(folder)}
      />
    ),
    [currentFolder, folders]
  );

  return (
    <DriveContent
      items={items}
      viewMode={viewMode}
      title="Home"
      breadcrumb={breadcrumbs}
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
