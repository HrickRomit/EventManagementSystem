import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbFgSbikUOfX8MFT0PQi_eIYAxklskngI",
  authDomain: "sems-9d72b.firebaseapp.com",
  projectId: "sems-9d72b",
  storageBucket: "sems-9d72b.firebasestorage.app",
  messagingSenderId: "366030776141",
  appId: "1:366030776141:web:985ab0ff94eb0fd2537904",
  measurementId: "G-TZ1FP3MG85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;