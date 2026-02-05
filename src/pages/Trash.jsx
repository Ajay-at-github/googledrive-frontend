import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Download,
  RotateCcw,
  Cloud,
  Search,
  LayoutGrid,
  List,
  HelpCircle,
  Settings,
  Home as HomeIcon,
  HardDrive,
  Star,
  Plus,
} from "lucide-react";
import {
  getFolders,
  deleteFolder,
  downloadFolder,
} from "../api/folder.api";
import {
  deleteFile,
  getFiles,
  getDownloadUrl,
} from "../api/file.api";
import { isTrashed, getTrashedIds, removeFromTrash, emptyTrash as emptyTrashStorage } from "../utils/trashedItems";

const navItems = [
  { label: "Home", icon: HomeIcon, route: "/home" },
  { label: "My Drive", icon: HardDrive, route: "/my-drive" },
  { label: "Starred", icon: Star, route: "/starred" },
  { label: "Trash", icon: Trash2, route: "/trash" },
];

export function Trash() {
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("list");

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

  // Normalize items
  const normalizeItem = (item, type) => ({
    ...item,
    type: type,
    id: item._id,
    starred: item.starred || false,
    trashed: isTrashed(item._id),
  });

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  // Combine folders and files, filter trashed items from localStorage
  useEffect(() => {
    const trashedIds = getTrashedIds();
    const combined = [
      ...folders.map((f) => normalizeItem(f, "folder")),
      ...files.map((f) => normalizeItem(f, "file")),
    ]
      .filter((item) => trashedIds.includes(item.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setItems(combined);
    setSelectedItems(new Set());
  }, [folders, files]);

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["doc", "docx", "txt"].includes(ext)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length && items.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
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

  const handleRestoreSingle = (item) => {
    removeFromTrash(item._id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    alert(
      `Restored ${item.name} to ${item.type === "folder" ? "My Drive" : "its original location"}`
    );
  };

  const handleDeleteSingle = async (item) => {
    if (
      !window.confirm(
        `Permanently delete "${item.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      if (item.type === "folder") {
        await deleteFolder(item._id);
      } else {
        await deleteFile(item._id);
      }
      removeFromTrash(item._id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Failed to permanently delete item", err);
      alert("Failed to delete item: " + err.message);
    }
  };

  const handleRestoreSelected = () => {
    if (selectedItems.size === 0) return;

    for (const itemId of selectedItems) {
      removeFromTrash(itemId);
    }
    setItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
    setSelectedItems(new Set());
    alert(`Restored ${selectedItems.size} item(s)`);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    if (
      !window.confirm(
        `Permanently delete ${selectedItems.size} item(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        const item = items.find((i) => i.id === itemId);
        if (item) {
          if (item.type === "folder") {
            await deleteFolder(item._id);
          } else {
            await deleteFile(item._id);
          }
          removeFromTrash(itemId);
        }
      }
      setItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
      setSelectedItems(new Set());
      alert(`Permanently deleted ${selectedItems.size} item(s)`);
    } catch (err) {
      console.error("Failed to delete items", err);
      alert("Failed to delete some items: " + err.message);
    }
  };

  const handleEmptyTrash = async () => {
    if (items.length === 0) {
      alert("Trash is already empty");
      return;
    }

    if (
      !window.confirm(
        `Permanently delete all ${items.length} item(s) in trash? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      for (const item of items) {
        if (item.type === "folder") {
          await deleteFolder(item._id);
        } else {
          await deleteFile(item._id);
        }
      }
      emptyTrashStorage();
      setItems([]);
      alert("Trash emptied successfully");
    } catch (err) {
      console.error("Failed to empty trash", err);
      alert("Failed to empty trash: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white/80 px-4 py-6">
          <button
            onClick={() => navigate("/home")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New
          </button>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === "Trash";
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-64">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <Cloud className="h-4 w-4" />
                Storage
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[13%] bg-blue-600" />
              </div>
              <p className="text-xs text-slate-600">2.0 GB of 15 GB used</p>
              <button className="mt-3 w-full rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50">
                Get more storage
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-4">
                <Cloud className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-slate-800">CloudDrive</h1>
              </div>

              <div className="flex flex-1 items-center justify-center px-12">
                <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in Drive"
                    className="w-full rounded-full border-0 bg-slate-100 py-2.5 pl-12 pr-4 text-sm text-slate-800 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 transition ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  U
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="px-8 py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Trash</h2>
              <p className="mt-1 text-sm text-slate-600">
                {items.length} item{items.length !== 1 ? "s" : ""} in trash
              </p>
            </div>

        {/* Action Buttons */}
        {items.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              {selectedItems.size === items.length && items.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>

            {selectedItems.size > 0 && (
              <>
                <button
                  onClick={handleRestoreSelected}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Restore ({selectedItems.size})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete ({selectedItems.size})
                </button>
              </>
            )}

            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium ml-auto flex items-center gap-2"
            >
              <Trash2 size={16} /> Empty Trash
            </button>
          </div>
        )}

        {/* Items Table */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Trash2 size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500 text-lg">Trash is empty</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === items.length && items.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 font-semibold text-sm">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 font-semibold text-sm">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 font-semibold text-sm">
                    DATE DELETED
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 font-semibold text-sm">
                    SIZE
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 font-semibold text-sm">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getFileIcon(item.name)}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 capitalize text-sm">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {formatDate(item.createdAt || item.modifiedAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.type === "folder"
                        ? "—"
                        : formatFileSize(item.fileSize)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {item.type === "file" && (
                          <button
                            onClick={() => handleDownloadFile(item)}
                            title="Download"
                            className="p-2 rounded hover:bg-slate-100 text-blue-600 transition-colors"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        {item.type === "folder" && (
                          <button
                            onClick={() => handleDownloadFolder(item)}
                            title="Download as ZIP"
                            className="p-2 rounded hover:bg-slate-100 text-blue-600 transition-colors"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRestoreSingle(item)}
                          title="Restore"
                          className="p-2 rounded hover:bg-slate-100 text-emerald-600 transition-colors"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(item)}
                          title="Permanently Delete"
                          className="p-2 rounded hover:bg-slate-100 text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
