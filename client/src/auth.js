import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// GOOGLE LOGIN
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// EMAIL SIGNUP
export const signUpWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};

// EMAIL LOGIN
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};
