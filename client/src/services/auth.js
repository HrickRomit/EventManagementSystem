import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import api from "./api";
import { auth } from "../firebase";

export const registerWithFirebaseEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const loginWithFirebaseEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const register = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const loginAdmin = async (payload) => {
  const response = await api.post("/admin/login", payload);
  return response.data;
};

export const phoneAuth = async (payload) => {
  const response = await api.post("/auth/phone", payload);
  return response.data;
};

export const googleAuth = async (payload) => {
  const response = await api.post("/auth/google", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
