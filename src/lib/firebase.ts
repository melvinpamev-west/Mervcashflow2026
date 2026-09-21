import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC_8RppLTSa2a07liwZXxOWvTEgGYGHVjo",
  authDomain: "mervflowmoney.firebaseapp.com",
  projectId: "mervflowmoney",
  storageBucket: "mervflowmoney.firebasestorage.app",
  messagingSenderId: "563135303849",
  appId: "1:563135303849:web:1de1ca6d69ca022c7199b8",
  measurementId: "G-JF6WSPSDZT"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export type { User };
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
};
