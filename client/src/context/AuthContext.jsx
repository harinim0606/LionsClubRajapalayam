import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        
        // Optional: verify token with backend silently
        try {
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
          }
        } catch (error) {
          // Token invalid or expired, clear local storage
          console.error("Token verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      
      if (res.data.success) {
        const { token, user: userData } = res.data.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        toast.success("Login successful!");
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
