import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDfynyWBZAKbDs4PAkl9aqRza6rb-6V_6M",
    authDomain: "tomoni-52570.firebaseapp.com",
    projectId: "tomoni-52570",
    storageBucket: "tomoni-52570.firebasestorage.app",
    messagingSenderId: "420548687475",
    appId: "1:420548687475:web:11c14d838f71bc382c9c06",
    measurementId: "G-ZJ59FL3T8C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
