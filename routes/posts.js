import express from 'express';
import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const router = express.Router();

// Route to display all posts
router.get('/', async (req, res) => {
    try {
        const postsCollection = collection(db, 'posts');
        const snapshot = await getDocs(postsCollection);
        
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('posts/index', { posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.render('error', { error: 'Failed to load posts' });
    }
});

// Route to display a single post
router.get('/post/:id', async (req, res) => {
    try {
        const postDoc = doc(db, 'posts', req.params.id);
        const snapshot = await getDoc(postDoc);

        if (!snapshot.exists()) {
            return res.status(404).render('error', { error: 'Post not found' });
        }

        const post = {
            id: snapshot.id,
            ...snapshot.data()
        };

        res.render('posts/show', { post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.render('error', { error: 'Failed to load post' });
    }
});

export const postRouter = router;
