// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdvqFpKHpguqUcnkreu5nYotqtdDzzHY4",
  authDomain: "evolucao-educacional.firebaseapp.com",
  projectId: "evolucao-educacional",
  storageBucket: "evolucao-educacional.firebasestorage.app",
  messagingSenderId: "841004951746",
  appId: "1:841004951746:web:44a6f884840b35f415335b",
  measurementId: "G-0NC9FJJDND"
};

const app = initializeApp(firebaseConfig);

// Exporta os serviços que serão usados em outras partes do seu projeto
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exporta funções e provedores para facilitar o uso
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, doc, getDoc, collection };
