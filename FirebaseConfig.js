/* eslint-disable no-undef */
const { initializeApp } = require("firebase/app");
const { getAuth, GoogleAuthProvider } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");
require('dotenv').config();






const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "judy-hub-ecommerce.firebaseapp.com",
  projectId: "judy-hub-ecommerce",
  storageBucket: "judy-hub-ecommerce.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDERID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: "G-N0S8329WMD"
};


const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
