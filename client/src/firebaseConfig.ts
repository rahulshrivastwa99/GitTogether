// client/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // 🔥 Import Auth services

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJyutEero7Inn1i6CkESvM89g6ABSc5VU",
  authDomain: "gittogether-gdsc.firebaseapp.com",
  projectId: "gittogether-gdsc",
  storageBucket: "gittogether-gdsc.firebasestorage.app",
  messagingSenderId: "894529412582",
  appId: "1:894529412582:web:083fa36710b3ca2f360a27",
  measurementId: "G-PNYPQKL4C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Export Authentication vars so your app can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();