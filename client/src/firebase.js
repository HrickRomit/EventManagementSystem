import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiwDYVVAP3_qDOkPt8gircd1BN-vwAJwQ",
  authDomain: "event-management-7c019.firebaseapp.com",
  projectId: "event-management-7c019",
  storageBucket: "event-management-7c019.firebasestorage.app",
  messagingSenderId: "787128586276",
  appId: "1:787128586276:web:7e2adecb25284858a388b1",
  measurementId: "G-TLXJ7ED13H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;