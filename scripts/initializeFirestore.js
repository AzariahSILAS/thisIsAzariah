import { db } from '../config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

async function createInitialPost() {
    try {
        const postsCollection = collection(db, 'posts');
        
        const testPost = {
            title: "Welcome to My Blog",
            slug: "welcome-to-my-blog",
            content: "This is my first blog post using Firebase Firestore!",
            excerpt: "A brief introduction to my new blog.",
            author: "Azariah",
            coverImage: "",
            tags: ["welcome", "first-post"],
            status: "published",
            views: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(postsCollection, testPost);
        console.log("Test post created with ID:", docRef.id);
    } catch (error) {
        console.error("Error creating test post:", error);
    }
}

// Run the initialization
createInitialPost(); 