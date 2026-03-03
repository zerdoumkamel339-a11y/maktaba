// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCF-IsQW40qaWMNq6YVi5cPTHoUD7F_X-M",
    authDomain: "aialgeriedeployment.firebaseapp.com",
    projectId: "aialgeriedeployment",
    storageBucket: "aialgeriedeployment.firebasestorage.app",
    messagingSenderId: "52091028921",
    appId: "1:52091028921:web:7351732ef5ebae39c5a268"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase initialized successfully.");
