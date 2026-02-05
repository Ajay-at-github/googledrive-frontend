import React, { useState } from "react";
import CreateFolderModal from "../drive/CreateFolderModal";

export default function Sidebar({ onCreateFolder }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="w-60 bg-gray-50 border-r h-full p-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded mb-6 hover:bg-blue-700"
        >
          + New Folder
        </button>

        <nav className="space-y-2 text-sm">
          <div className="font-medium text-gray-700 cursor-pointer">
            My Drive
          </div>
        </nav>
      </aside>

      {showModal && (
        <CreateFolderModal
          onClose={() => setShowModal(false)}
          onCreate={(name) => {
            onCreateFolder(name);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
