import React, { useState } from "react";

export default function CreateFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-lg font-semibold mb-4">
          New Folder
        </h2>

        <input
          type="text"
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1 text-sm bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
