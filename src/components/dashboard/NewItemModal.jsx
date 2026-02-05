import React, { useState } from "react";
import { FolderPlus, Upload, X } from "lucide-react";

export function NewItemModal({ onClose, onCreateFolder, onUploadFile }) {
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState("");
  const fileInputRef = React.useRef(null);

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    onCreateFolder(folderName);
    setFolderName("");
    setShowFolderInput(false);
    onClose();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadFile(files);
      onClose();
    }
  };

  if (showFolderInput) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-lg">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">New Folder</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <input
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") onClose();
                }}
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-slate-200 px-6 py-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">New</h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="space-y-2">
              {/* Create Folder Option */}
              <button
                onClick={() => setShowFolderInput(true)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-blue-50 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FolderPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Create Folder</div>
                    <div className="text-xs text-slate-500">
                      Create a new folder
                    </div>
                  </div>
                </div>
              </button>

              {/* Upload File Option */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-blue-50 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Upload File</div>
                    <div className="text-xs text-slate-500">
                      Upload a file from your device
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
}
