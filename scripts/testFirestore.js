import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

async function testConnection() {
    try {
        // First try to read existing data
        console.log("Testing Firestore connection...");
        const testCollection = collection(db, 'test');
        
        // Try to read first
        console.log("Attempting to read collection...");
        const snapshot = await getDocs(testCollection);
        console.log("Current documents:", snapshot.size);

        // Then try to write
        const testDoc = {
            message: "Hello Firestore",
            timestamp: new Date().toISOString()
        };

        console.log("Attempting to add document...");
        const docRef = await addDoc(testCollection, testDoc);
        console.log("Success! Document written with ID:", docRef.id);
    } catch (error) {
        if (error.code === 5) {
            console.error("Database not found. Please ensure you have:");
            console.error("1. Created the database in Firebase Console");
            console.error("2. Waited 3-5 minutes for initialization");
            console.error("3. Selected the correct project:", db._databaseId.projectId);
        } else {
            console.error("Connection error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
        }
    }
}

// Add a longer delay to ensure full initialization
setTimeout(testConnection, 5000); 