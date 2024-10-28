import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyBq9jm4K-hmVckw8d2krOHidFcD81XPh4A",
  authDomain: "untitled-7b6a6.firebaseapp.com",
  projectId: "untitled-7b6a6",
  storageBucket: "untitled-7b6a6.appspot.com",
  messagingSenderId: "1039686354153",
  appId: "1:1039686354153:web:7af97d9f77b018cf7e1c78",
  measurementId: "G-BXNNKPELZX"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);