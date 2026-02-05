// Manage trashed items using localStorage (frontend-only trash)
// Items in trash are tracked separately and never sent to backend until fully deleted

export const getTrashedIds = () => {
  try {
    const data = localStorage.getItem("cloudDrive_trashed");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to parse trashed items from localStorage", err);
    return [];
  }
};

export const isTrashed = (itemId) => {
  const trashedIds = getTrashedIds();
  return trashedIds.includes(itemId);
};

export const addToTrash = (itemId) => {
  const trashedIds = getTrashedIds();
  if (!trashedIds.includes(itemId)) {
    trashedIds.push(itemId);
    localStorage.setItem("cloudDrive_trashed", JSON.stringify(trashedIds));
  }
};

export const removeFromTrash = (itemId) => {
  const trashedIds = getTrashedIds();
  const filtered = trashedIds.filter((id) => id !== itemId);
  localStorage.setItem("cloudDrive_trashed", JSON.stringify(filtered));
};

export const emptyTrash = () => {
  localStorage.setItem("cloudDrive_trashed", JSON.stringify([]));
};
