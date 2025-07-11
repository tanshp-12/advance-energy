// Firebase App (the core Firebase SDK) is always required and must be listed first
// Add this script in your HTML before any script that uses Firebase

// Firebase CDN scripts (add these in your HTML <head> or before this script):
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyDKBXkc_9NDQuUOsoRh46GeYaVJ5UHDbwM",
  authDomain: "advance-350e4.firebaseapp.com",
  projectId: "advance-350e4",
  storageBucket: "advance-350e4.firebasestorage.app",
  messagingSenderId: "946820083154",
  appId: "1:946820083154:web:71a1292fd6f058c65d6c0b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
// Now you can use `database` in other scripts by including this file after the Firebase CDN scripts. 