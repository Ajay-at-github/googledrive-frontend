import api from "../utils/axios";

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const activate = (token) => {
  return api.get(`/auth/activate?token=${token}`);
};

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPassword = (payload) => {
  return api.post("/auth/reset-password", payload);
};
