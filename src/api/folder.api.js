import api from "../utils/axios";

export const createFolder = (data) => {
  return api.post("/folders", data);
};

export const getFolders = () => {
  return api.get("/folders");
};

export const trashFolder = (id) =>
  api.patch(`/folders/${id}`, { trashed: true });

export const deleteFolder = (id) => api.delete(`/folders/${id}`);

export const restoreFolder = (id) =>
  api.patch(`/folders/${id}`, { trashed: false });

export const renameFolder = (id, data) =>
  api.patch(`/folders/${id}`, data);

export const downloadFolder = (id) =>
  api.get(`/folders/${id}/download`, {
    responseType: "blob",
  });