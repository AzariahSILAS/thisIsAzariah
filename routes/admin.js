import express from 'express';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Login page
router.get('/login', (req, res) => {
    res.render('admin/login');
});

// Login process
router.post('/login', (req, res) => {
    if (req.body.username === process.env.ADMIN_USERNAME &&
        req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Invalid credentials' });
    }
});

// Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const postsCollection = collection(db, 'posts');
        const snapshot = await getDocs(postsCollection);
        
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            comments: doc.data().comments || []
        }));

        res.render('admin/dashboard', { 
            posts,
            totalPosts: posts.length,
            totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0)
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('error', { error: 'Failed to load dashboard' });
    }
});

// Create post page
router.get('/create', isAdmin, (req, res) => {
    console.log('Accessing create post page');
    try {
        res.render('admin/create', { 
            title: 'Create New Post',
            isAdmin: req.session.isAdmin 
        });
    } catch (error) {
        console.error('Error rendering create page:', error);
        res.render('error', { error: 'Failed to load create page' });
    }
});

// Create post process
router.post('/create', isAdmin, async (req, res) => {
    try {
        const postsCollection = collection(db, 'posts');
        const newPost = {
            title: req.body.title,
            content: req.body.content,
            author: req.body.author || 'Admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
        };

        await addDoc(postsCollection, newPost);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error creating post:', error);
        res.render('error', { error: 'Failed to create post' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.isAdmin = false;
    res.redirect('/admin/login');
});

// Add this route alias
router.get('/posts/new', isAdmin, (req, res) => {
    res.redirect('/admin/create');
});

export const adminRouter = router;
