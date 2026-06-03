import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDArOJvdNg3E1J7hufLMLkuVp9dmCr2VVc",
  authDomain: "privacylens-abed7.firebaseapp.com",
  projectId: "privacylens-abed7",
  storageBucket: "privacylens-abed7.firebasestorage.app",
  messagingSenderId: "1085745994920",
  appId: "1:1085745994920:web:0530b6b568a5413bd2f69d",
  measurementId: "G-V6ENYXTBKK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

export default app;