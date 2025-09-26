// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5a7dy9EvEHl-iZo_4wbR7nSCCq-3BIfw",
  authDomain: "kids-chore-tracker-762f8.firebaseapp.com",
  projectId: "kids-chore-tracker-762f8",
  storageBucket: "kids-chore-tracker-762f8.firebasestorage.app",
  messagingSenderId: "528451631659",
  appId: "1:528451631659:web:bfc2fb02ffde557decc86e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);