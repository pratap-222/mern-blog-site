import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA--geiH4Ol54z-Ew38CHBwVdQc0J9ks2s",
  authDomain: "blog-site-78ad5.firebaseapp.com",
  projectId: "blog-site-78ad5",
  storageBucket: "blog-site-78ad5.appspot.com",
  messagingSenderId: "498284619978",
  appId: "1:498284619978:web:17f6d0520f5bc32430ac33",
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  try {
    const data = await signInWithPopup(auth, provider);
    return data?.user;
  } catch (error) {
    console.log(error);
  }
};
