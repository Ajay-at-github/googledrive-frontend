import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  ArrowUpDown,
  Cloud,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  HardDrive,
  HelpCircle,
  Home as HomeIcon,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { NewItemModal } from "./NewItemModal";

const navItems = [
  { label: "Home", icon: HomeIcon, route: "/home" },
  { label: "My Drive", icon: HardDrive, route: "/my-drive" },
  { label: "Starred", icon: Star, route: "/starred" },
  { label: "Trash", icon: Trash2, route: "/trash" },
];

const formatDate = (date) => {
  if (!date) return "";
  const value = date instanceof Date ? date : new Date(date);
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (item) => {
  if (item.type === "folder") return Folder;
  const extension = item.name.split(".").pop()?.toLowerCase();
  if (["xlsx", "xls", "csv"].includes(extension)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(extension)) return FileImage;
  if (["doc", "docx", "pdf", "txt", "ppt", "pptx"].includes(extension)) return FileText;
  return File;
};

export function DriveContent({
  items,
  viewMode: initialViewMode,
  title,
  breadcrumb,
  onStarItem,
  onDownloadItem,
  onTrashItem,
  onItemClick,
  onCreateFolder,
  onUploadFile,
  onDownloadFile,
  onDownloadFolder,
  onDeleteFile,
  onDeleteFolder,
  onRenameItem,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const activeLabel = title || "Home";
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode || "list");
  const [showLogout, setShowLogout] = useState(false);

  const handleCreateFolder = (folderName) => {
    onCreateFolder?.(folderName);
  };

  const handleUploadFile = (files) => {
    onUploadFile?.(files);
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white/80 px-4 py-6">
          <button
            onClick={() => setShowNewItemModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            type="button"
          >
            <Plus className="h-4 w-4" />
            New
          </button>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const isActive = activeLabel === item.label;
              const Icon = item.icon;
              return (
                <button
                  onClick={() => navigate(item.route)}
                  key={item.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Cloud className="h-4 w-4" />
              Storage
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[18%] rounded-full bg-blue-600" />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              2.0 GB of 15 GB used
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Get more storage
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Cloud className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">CloudDrive</span>
            </div>

            <div className="relative flex-1 px-6">
              <Search className="absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-lg p-2 hover:bg-slate-100">
                <HelpCircle className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLogout((prev) => !prev)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4" />
                </button>
                {showLogout && (
                  <button
                    type="button"
                    onClick={logout}
                    className="absolute right-0 top-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Logout
                  </button>
                )}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                U
              </div>
            </div>
          </header>

          <main className="flex-1 px-8 py-6">
            <div className="mb-4">
              <div className="text-xl font-semibold text-slate-800">
                {title}
              </div>
            </div>

            {breadcrumb ? <div className="mb-4">{breadcrumb}</div> : null}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[1.6fr_0.7fr_0.6fr_0.5fr_0.6fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Name</span>
                <span>Owner</span>
                <span>Date Modified</span>
                <span>File Size</span>
                <span>Actions</span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-500">
                  {searchQuery ? "No items match your search" : "No items found"}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = getFileIcon(item);
                  const isStarred = Boolean(item.starred);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick?.(item)}
                      className="grid cursor-pointer grid-cols-[1.6fr_0.7fr_0.6fr_0.5fr_0.6fr] items-center gap-4 border-b border-slate-100 px-6 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-slate-500" />
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                          ME
                        </div>
                        <span className="text-slate-600">me</span>
                      </div>
                      <div className="text-slate-500">
                        {formatDate(item.modifiedAt || item.updatedAt || item.createdAt)}
                      </div>
                      <div className="text-slate-500">
                        {item.type === "folder"
                          ? "-"
                          : formatSize(item.size ?? item.fileSize)}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onStarItem?.(item);
                          }}
                          className={`transition ${
                            isStarred ? "text-yellow-500" : "hover:text-slate-600"
                          }`}
                        >
                          <Star className="h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
                        </button>
                        {onRenameItem && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRenameItem?.(item);
                            }}
                            className="transition hover:text-slate-600"
                            title="Rename"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (item.type === "folder") {
                              onDownloadFolder?.(item);
                            } else {
                              onDownloadFile?.(item);
                            }
                          }}
                          className="transition hover:text-slate-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (item.type === "folder") {
                              setDeleteConfirm({ type: "folder", item });
                            } else {
                              setDeleteConfirm({ type: "file", item });
                            }
                          }}
                          className="transition hover:text-slate-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      {showNewItemModal && (
        <NewItemModal
          onClose={() => setShowNewItemModal(false)}
          onCreateFolder={handleCreateFolder}
          onUploadFile={handleUploadFile}
        />
      )}

      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Move to Trash ?
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to move "{deleteConfirm.item.name}" to Trash?
                </p>
              </div>
              <div className="flex gap-3 border-t border-slate-200 px-6 py-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === "folder") {
                      onDeleteFolder?.(deleteConfirm.item._id || deleteConfirm.item.id);
                    } else {
                      onDeleteFile?.(deleteConfirm.item._id || deleteConfirm.item.id);
                    }
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
