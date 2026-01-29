// --------------------------------------------------------
// FIREBASE CONFIGURATION
// --------------------------------------------------------
// 1. Go to console.firebase.google.com
// 2. Create a new project
// 3. Go to Project Settings > General > "Add app" (Web)
// 4. Copy the "firebaseConfig" object below and replace the placeholders
// --------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAuAWKSnRFKrSCJe0KlvD-zgJFdWhfW3rk",
  authDomain: "eye-abnormality-detector-baf63.firebaseapp.com",
  projectId: "eye-abnormality-detector-baf63",
  storageBucket: "eye-abnormality-detector-baf63.firebasestorage.app",
  messagingSenderId: "171958304596",
  appId: "1:171958304596:web:e52dafd941fcec634192c1",
  measurementId: "G-EM2C8NH0K3",
  // NOTE: This URL is guessed based on your Project ID.
  // If it fails, check your Firebase Console > Realtime Database > Data tab for the correct URL.
  databaseURL: "https://eye-abnormality-detector-baf63-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Services
const database = firebase.database();
// Check if analytics is supported/loaded
let analytics;
try {
  if (firebase.analytics) {
    analytics = firebase.analytics();
  }
} catch (e) {
  console.log("Analytics not loaded");
}

console.log("Firebase Initialized with Project ID: eye-abnormality-detector-baf63");
