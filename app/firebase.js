import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase 配置信息
const firebaseConfig = {
  apiKey: "AIzaSyCoD7IlGDwwunNtaEHUyThJ0bNRrvt8qfI",
  authDomain: "xaichat-9cf23.firebaseapp.com",
  projectId: "xaichat-9cf23",
  storageBucket: "xaichat-9cf23.firebasestorage.app",
  messagingSenderId: "107471567137",
  appId: "1:107471567137:web:9fc49b2da5c124803d2660",
  measurementId: "G-6EV3DDJK85"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化并导出 Firebase 服务
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 仅在浏览器环境中初始化 Analytics
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics }; 