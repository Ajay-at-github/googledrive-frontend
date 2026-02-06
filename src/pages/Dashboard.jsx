import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import UploadZone from "../components/drive/UploadZone";
import { getFolders, createFolder, deleteFolder, renameFolder, downloadFolder } from "../api/folder.api";
import { deleteFile, renameFile, getFiles, getDownloadUrl } from "../api/file.api";
import Breadcrumbs from "../components/drive/Breadcrumbs";

export default function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const API_ENABLED = !!import.meta.env.VITE_API_BASE_URL;

  // Fetch folders on load
  const fetchFolders = async () => {
    try {
      const res = await getFolders();
      setFolders(res.data);
    } catch (err) {
      if (!API_ENABLED) return;
      console.error("Failed to fetch folders", err);
    }
  };

  // Create a new folder
  const handleCreateFolder = async (name) => {
      const res = await createFolder({
        name,
        parentFolderId: currentFolder?._id || null,
      });

    setFolders((prev) => [...prev, res.data.folder]);
  };

  // Open a folder
  const openFolder = (folder) => {
    setCurrentFolder(folder);
    // later: fetchFilesByFolder(folderId)
  };

  const normalizeFile = (file) => ({
    ...file,
    name: file.name || file.fileName,
  });

  const fetchFiles = async () => {
    try {
      const res = await getFiles();

      const normalizedFiles = res.data
        .map(normalizeFile)
        .filter((file) => file._id && file.s3Key);

      setFiles(normalizedFiles);
    } catch (err) {
      if (!API_ENABLED) return;
      console.error("Failed to fetch files", err);
    }
  };

  // Handle file upload success
  const handleUploadSuccess = (file) => {
    const fileData = file?.file || file;
    if (!fileData?._id || !fileData?.s3Key) {
      return;
    }
    setFiles((prev) => [...prev, normalizeFile(fileData)]);
  };

  // Delete a folder
  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this folder?")) {
      return;
    }
    try {
      console.log("Deleting folder with ID:", folderId);
      const response = await deleteFolder(folderId);
      console.log("Delete response:", response);
      setFolders((prev) => prev.filter((folder) => folder._id !== folderId));
    } catch (err) {
      console.error("Failed to delete folder", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to delete folder: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete a file
  const handleDeleteFile = async (e, file) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }
    try {
      console.log("Deleting file:", file);
      const fileId = file._id;
      if (!fileId) {
        alert("Cannot delete file: Missing file ID. Re-upload the file or refresh after backend persists it.");
        return;
      }
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      console.error("Failed to delete file", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to delete file: ${err.response?.data?.message || err.message}`);
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
      setFolders((prev) =>
        prev.map((f) => (f._id === folder._id ? updatedFolder : f))
      );
      if (currentFolder?._id === folder._id) {
        setCurrentFolder(updatedFolder);
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
      setFiles((prev) =>
        prev.map((f) => (f._id === file._id ? normalizeFile(updatedFile) : f))
      );
    } catch (err) {
      console.error("Failed to rename file", err);
      alert("Failed to rename file");
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await getDownloadUrl(file._id);
      const { downloadUrl, fileName } = res.data;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName; // forces download
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

  const visibleFolders = folders.filter((folder) => {
    // Root level
    if (!currentFolder) {
      return folder.parentFolderId === null || folder.parentFolderId === undefined;
    }

    // Inside a folder - compare both as strings and handle null/undefined
    const folderParentId = folder.parentFolderId ? String(folder.parentFolderId) : null;
    const currentFolderId = currentFolder._id ? String(currentFolder._id) : null;
    
    console.log("Comparing:", folderParentId, "===", currentFolderId, "for folder:", folder.name);
    
    return folderParentId === currentFolderId;
  });

  const visibleFiles = files.filter((file) => {
    if (!currentFolder) {
      return file.folderId === null || file.folderId === undefined;
    }
    return String(file.folderId) === String(currentFolder._id);
  });

  useEffect(() => {
    if (!API_ENABLED) return;
    fetchFolders();
    fetchFiles();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateFolder={handleCreateFolder} />

        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            My Drive
          </h2>

          {/* Breadcrumbs */}
          <Breadcrumbs
            folder={currentFolder}
            folders={folders}
            onNavigate={(folder) => setCurrentFolder(folder)}
          />

          {/* Upload Section */}
          <div className="mb-6">
            <UploadZone
              folderId={currentFolder?._id || null}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Folders */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {visibleFolders.map((folder) => (
              <div
                key={folder._id}
                onDoubleClick={() => openFolder(folder)}
                className="bg-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-50 transition relative group"
              >
                <button onClick={() => handleRenameFolder(folder)}>✏️</button>
                <button onClick={() => handleDownloadFolder(folder)}>
                  ⬇️ ZIP
                </button>
                <button
                  onClick={(e) => handleDeleteFolder(e, folder._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  title="Delete folder"
                >
                  🗑️
                </button>
                <div className="text-4xl">📁</div>
                <div className="mt-2 text-sm font-medium">{folder.name}</div>
              </div>
            ))}
          </div>

          {/* Files */}
          <div className="grid grid-cols-4 gap-4">
            {visibleFiles.map((file, index) => (
              <div
                key={file._id || file.key || index}
                className="bg-white p-4 rounded shadow text-center relative group"
              >
                <button onClick={() => handleDownloadFile(file)} title="Download">
                  ⬇️
                </button>
                <button onClick={() => handleRenameFile(file)}>✏️</button>
                <button
                  onClick={(e) => handleDeleteFile(e, file)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  title="Delete file"
                >
                  🗑️
                </button>
                <div className="text-4xl">📄</div>
                <div className="mt-2 text-sm">
                  {file.fileName}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
