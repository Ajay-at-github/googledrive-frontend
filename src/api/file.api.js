import api from "../utils/axios";

export const createFile = (data) => {
  return api.post("/files", data);
};

export const getUploadUrl = (data) => {
  return api.post("/files/upload-url", data);
};

export const getFiles = () => {
  return api.get("/files");
};

export const deleteFile = (id) =>
  api.delete(`/files/${encodeURIComponent(id)}`);

export const renameFile = (id, data) =>
  api.patch(`/files/${id}`, data);

export const getDownloadUrl = (fileId) =>
  api.get(`/files/${fileId}/download-url`);