import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DriveContent } from "../components/dashboard/DriveContent";
import Breadcrumbs from "../components/drive/Breadcrumbs";
import {
  getFolders,
  createFolder,
  deleteFolder,
  renameFolder,
  downloadFolder,
} from "../api/folder.api";
import {
  deleteFile,
  renameFile,
  getFiles,
  getDownloadUrl,
} from "../api/file.api";
import { uploadFiles } from "../utils/uploadFiles";
import { isStarred, toggleStar } from "../utils/starredItems";
import { isTrashed, addToTrash } from "../utils/trashedItems";

export function MyDrive() {
  const outletContext = useOutletContext() || {};
  const viewMode = outletContext.viewMode || "list";

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
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

  // Normalize items
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

  // Combine folders and files, filter non-trashed and current folder
  useEffect(() => {
    const combined = [
      ...folders.map((f) => normalizeItem(f, "folder")),
      ...files.map((f) => normalizeItem(f, "file")),
    ]
      .filter((item) => !item.trashed)
      .filter(isInCurrentFolder);
    setItems(combined);
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
    try {
      const folderId = toId(currentFolder?._id || currentFolder?.id || null);
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
      title="My Drive"
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
