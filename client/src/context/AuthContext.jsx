import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest, signup as signupRequest } from "../services/authService.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "teamTaskManagerAuth";

const readStoredAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, token: null };

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStoredAuth);
  const navigate = useNavigate();

  const persistAuth = (payload) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  };

  const login = async (credentials) => {
    const payload = await loginRequest(credentials);
    persistAuth(payload);
    navigate("/dashboard");
  };

  const signup = async (data) => {
    const payload = await signupRequest(data);
    persistAuth(payload);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ user: null, token: null });
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.token),
      login,
      signup,
      logout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export { STORAGE_KEY };
