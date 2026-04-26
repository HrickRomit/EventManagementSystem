import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, login, register } from "../services/auth";

const TOKEN_KEY = "eventsphere-token";
const USER_KEY = "eventsphere-user";

const AuthContext = createContext(null);

const readStoredUser = () => {
  const raw = window.localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(Boolean(window.localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        window.localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const persistSession = (payload) => {
    window.localStorage.setItem(TOKEN_KEY, payload.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const loginUser = async (payload) => {
    const authPayload = await login(payload);
    persistSession(authPayload);
    return authPayload;
  };

  const registerUser = async (payload) => {
    const authPayload = await register(payload);
    persistSession(authPayload);
    return authPayload;
  };

  const logoutUser = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        loginUser,
        registerUser,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
