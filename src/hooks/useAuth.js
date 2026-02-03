import { useAuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { token, login, logout, isAuthenticated } = useAuthContext();

  return {
    token,
    login,
    logout,
    isAuthenticated,
  };
};

export default useAuth;
