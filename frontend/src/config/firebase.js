// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB_mH7utcM1_bm-TbZr9HtIZVpKCwz5ZTE",
    authDomain: "campus-os-3f198.firebaseapp.com",
    projectId: "campus-os-3f198",
    storageBucket: "campus-os-3f198.firebasestorage.app",
    messagingSenderId: "727230596128",
    appId: "1:727230596128:web:11057947e87f2b16416845",
    measurementId: "G-HF3P7HHGGV"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Cloud Messaging
let messaging;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { auth, db, googleProvider, messaging };
export default app;
