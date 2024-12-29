import { db } from '../config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

async function createCollection() {
    try {
        const postsCollection = collection(db, 'posts');
        
        const firstPost = {
            title: "Welcome to My Blog",
            content: "This is my first blog post!",
            author: "Azariah",
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(postsCollection, firstPost);
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

createCollection(); 