// localStorage key for starred items
const STARRED_ITEMS_KEY = "cloudDrive_starred";

/**
 * Get all starred item IDs from localStorage
 */
export const getStarredIds = () => {
  try {
    const stored = localStorage.getItem(STARRED_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Check if an item is starred
 */
export const isStarred = (itemId) => {
  return getStarredIds().includes(String(itemId));
};

/**
 * Toggle star for an item
 */
export const toggleStar = (itemId) => {
  const ids = getStarredIds();
  const itemIdStr = String(itemId);
  const index = ids.indexOf(itemIdStr);

  if (index > -1) {
    // Remove if already starred
    ids.splice(index, 1);
  } else {
    // Add if not starred
    ids.push(itemIdStr);
  }

  localStorage.setItem(STARRED_ITEMS_KEY, JSON.stringify(ids));
  return !Boolean(index > -1); // Return new starred state
};

/**
 * Add item to starred
 */
export const addToStarred = (itemId) => {
  const ids = getStarredIds();
  const itemIdStr = String(itemId);
  if (!ids.includes(itemIdStr)) {
    ids.push(itemIdStr);
    localStorage.setItem(STARRED_ITEMS_KEY, JSON.stringify(ids));
  }
};

/**
 * Remove item from starred
 */
export const removeFromStarred = (itemId) => {
  const ids = getStarredIds();
  const itemIdStr = String(itemId);
  const filtered = ids.filter((id) => id !== itemIdStr);
  localStorage.setItem(STARRED_ITEMS_KEY, JSON.stringify(filtered));
};
