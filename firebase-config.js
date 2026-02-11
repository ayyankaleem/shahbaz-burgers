// Firebase Configuration for Shahbaz Bhai Fast Food
const firebaseConfig = {
    apiKey: "AIzaSyDxQudnG6KQtDZaoUx2gIs7wWXfhgPYe64",
    authDomain: "shahbaz-burgers.firebaseapp.com",
    projectId: "shahbaz-burgers",
    storageBucket: "shahbaz-burgers.firebasestorage.app",
    messagingSenderId: "844080833365",
    appId: "1:844080833365:web:faecdb357831f32ab745dc",
    measurementId: "G-5VRGL9ZF4T"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
