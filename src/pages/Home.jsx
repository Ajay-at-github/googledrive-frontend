import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DriveContent } from "../components/dashboard/DriveContent";
import Breadcrumbs from "../components/drive/Breadcrumbs";
import {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  downloadFolder,
} from "../api/folder.api";
import {
  deleteFile,
  renameFile,
  getFiles,
  getDownloadUrl,
} from "../api/file.api";
import { uploadFiles } from "../utils/uploadFiles";
import { forceDownload } from "../utils/forceDownload";
import { isStarred, toggleStar, getStarredIds } from "../utils/starredItems";
import { isTrashed, addToTrash } from "../utils/trashedItems";

export function Home() {
  const outletContext = useOutletContext() || {};
  const viewMode = outletContext.viewMode || "list";

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const [uploadingItems, setUploadingItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
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

  const toId = (value) =>
    value?.$oid || value?._id?.$oid || value?._id || value || null;

  const normalizeFile = (file) => ({
    ...file,
    name: file.name || file.fileName,
    folderId: toId(file.folderId),
    _id: toId(file._id),
  });

  // Fetch files
  const fetchFiles = async (folderId) => {
    try {
      const res = await getFiles(folderId);
      const normalizedFiles = res.data
        .map(normalizeFile)
        .filter((file) => file._id && file.s3Key);
      setFiles(normalizedFiles);
    } catch (err) {
      if (!API_ENABLED) return;
      console.error("Failed to fetch files", err);
    }
  };

  // Combine folders and files, sort by recent
  const normalizeItem = (item, type) => {
    const itemId = toId(item._id || item.id || item);
    return {
      ...item,
      type: type,
      id: itemId,
      _id: itemId,
      parentFolderId: toId(item.parentFolderId),
      starred: isStarred(itemId),
      trashed: isTrashed(itemId),
      isUploading: Boolean(item.isUploading),
    };
  };

  useEffect(() => {
    if (!API_ENABLED) return;
    fetchFolders();
    fetchFiles();
  }, []);

  useEffect(() => {
    const folderId = toId(currentFolder?._id || currentFolder?.id || null);
    fetchFiles(folderId);
  }, [currentFolder]);


  const isInCurrentFolder = (item) => {
    if (!currentFolder) {
      if (item.type === "folder") {
        return item.parentFolderId === null || item.parentFolderId === undefined;
      }
      return item.folderId === null || item.folderId === undefined;
    }
    const currentFolderId = toId(currentFolder?._id || currentFolder?.id || currentFolder);
    if (item.type === "folder") {
      const parentId = toId(item.parentFolderId);
      return String(parentId || "") === String(currentFolderId || "");
    }
    return String(item.folderId || "") === String(currentFolderId || "");
  };

  useEffect(() => {
    const combined = [
      ...folders.map((f) => normalizeItem(f, "folder")),
      ...uploadingItems.map((f) => normalizeItem(f, "file")),
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
  }, [folders, files, uploadingItems, currentFolder]);

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
      const parentFolderId = toId(currentFolder?._id || currentFolder?.id || null);
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
    const filesToUpload = Array.from(fileList || []);
    if (filesToUpload.length === 0) return;
    const folderId = toId(currentFolder?._id || currentFolder?.id || null);
    const now = Date.now();
    const pendingItems = filesToUpload.map((file, index) => ({
      _id: `upload-${now}-${index}`,
      name: file.name,
      fileSize: file.size,
      size: file.size,
      folderId,
      createdAt: new Date().toISOString(),
      isUploading: true,
    }));
    const pendingIds = pendingItems.map((item) => item._id);
    setUploadingItems((prev) => [...prev, ...pendingItems]);

    try {
      const uploaded = await uploadFiles({
        files: filesToUpload,
        folderId,
      });
      const normalized = uploaded.map(normalizeFile);
      setFiles((prev) => [...prev, ...normalized]);
    } catch (err) {
      console.error("File upload failed", err);
      alert(err.message || "File upload failed");
    } finally {
      setUploadingItems((prev) =>
        prev.filter((item) => !pendingIds.includes(item._id))
      );
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await getDownloadUrl(file._id);
      const { downloadUrl, fileName } = res.data;
      await forceDownload({
        downloadUrl,
        fileName: fileName || file.name || file.fileName,
      });
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

  const handleRenameFolder = async (folder) => {
    const name = prompt("New folder name", folder.name);
    if (!name) return;
    if (!folder._id) {
      alert("Cannot rename folder: Missing folder ID");
      return;
    }

    try {
      const res = await renameFolder(folder._id, { name });
      const updatedFolder = res.data.folder || res.data;
      const nextModifiedAt = new Date().toISOString();
      setFolders((prev) =>
        prev.map((f) =>
          f._id === folder._id
            ? { ...updatedFolder, modifiedAt: updatedFolder.modifiedAt || nextModifiedAt }
            : f
        )
      );
      if (currentFolder?._id === folder._id) {
        setCurrentFolder((prev) => ({
          ...prev,
          ...updatedFolder,
          modifiedAt: updatedFolder.modifiedAt || nextModifiedAt,
        }));
      }
    } catch (err) {
      console.error("Failed to rename folder", err);
      alert("Failed to rename folder");
    }
  };

  const handleRenameFile = async (file) => {
    const currentName = file.fileName || file.name || "";
    const name = prompt("New file name", currentName);
    if (!name) return;
    if (!file._id) {
      alert("Cannot rename file: Missing file ID");
      return;
    }

    try {
      const res = await renameFile(file._id, { name, fileName: name });
      const updatedFile = res.data.file || res.data;
      const nextModifiedAt = new Date().toISOString();
      setFiles((prev) =>
        prev.map((f) =>
          f._id === file._id
            ? {
                ...f,
                ...updatedFile,
                name: updatedFile.name || updatedFile.fileName || name,
                modifiedAt: updatedFile.modifiedAt || nextModifiedAt,
              }
            : f
        )
      );
    } catch (err) {
      console.error("Failed to rename file", err);
      alert("Failed to rename file");
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
      onRenameItem={(item) =>
        item.type === "folder"
          ? handleRenameFolder(item)
          : handleRenameFile(item)
      }
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
