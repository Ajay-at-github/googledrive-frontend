import React, { useMemo } from "react";

export default function Breadcrumbs({ folder, folders = [], onNavigate }) {
  // Root
  if (!folder) {
    return (
      <div className="text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => onNavigate(null)}>
          My Drive
        </span>
      </div>
    );
  }

  const chain = useMemo(() => {
    if (!folder) return [];

    const folderMap = new Map(
      folders.map((item) => [String(item._id), item])
    );

    const items = [];
    let current = folder;
    let safety = 0;

    while (current && safety < 100) {
      items.unshift(current);
      const parentId = current.parentFolderId;
      if (!parentId) break;
      current = folderMap.get(String(parentId));
      safety += 1;
    }

    return items;
  }, [folder, folders]);

  return (
    <div className="text-sm text-gray-600 mb-4 flex items-center flex-wrap gap-1">
      <span
        className="font-medium cursor-pointer"
        onClick={() => onNavigate(null)}
      >
        My Drive
      </span>

      {chain.map((item) => (
        <span key={item._id} className="flex items-center gap-1">
          <span>/</span>
          <span
            className="font-medium cursor-pointer"
            onClick={() => onNavigate(item)}
          >
            {item.name}
          </span>
        </span>
      ))}
    </div>
  );
}
