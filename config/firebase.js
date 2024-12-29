import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log the configuration (but hide sensitive data)
console.log("Firebase Configuration:");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Database URL:", firebaseConfig.databaseURL);

let db;

try {
    const app = initializeApp(firebaseConfig);
    // Connect to specific database
    db = getFirestore(app, "thisisazariahdatabase");
    console.log('Connected to Firestore database: thisisazariahdatabase');
} catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
}

export { db };  