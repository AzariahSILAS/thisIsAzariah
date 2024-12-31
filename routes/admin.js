import express from 'express';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Admin middleware
const isAdmin = (req, res, next) => {
    console.log('Checking admin status:', req.session.isAdmin);
    if (req.session.isAdmin) {
        next();
    } else {
        console.log('Not admin, redirecting to login');
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
router.post('/create', isAdmin, upload.single('headerImage'), async (req, res) => {
    try {
        const postsCollection = collection(db, 'posts');
        const newPost = {
            title: req.body.title,
            content: req.body.content,
            author: req.body.author || 'Admin',
            headerImage: req.file ? `/uploads/${req.file.filename}` : '',
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

// Edit post page
router.get('/posts/:id', isAdmin, async (req, res) => {
    try {
        const postDoc = doc(db, 'posts', req.params.id);
        const postSnap = await getDoc(postDoc);
        
        if (!postSnap.exists()) {
            return res.render('error', { error: 'Post not found' });
        }

        const post = {
            id: postSnap.id,
            ...postSnap.data()
        };

        res.render('admin/edit-post', { post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.render('error', { error: 'Failed to load post' });
    }
});

// Update post
router.put('/posts/:id', isAdmin, upload.none(), async (req, res) => {
    console.log('Update route hit with ID:', req.params.id);
    console.log('Request body:', req.body);
    try {
        const postDoc = doc(db, 'posts', req.params.id);
        
        // Log the current post data
        const currentPost = await getDoc(postDoc);
        console.log('Current post data:', currentPost.data());

        const updatedPost = {
            title: req.body.title,
            content: req.body.content,
            excerpt: req.body.excerpt,
            author: req.body.author,
            updatedAt: new Date().toISOString()
        };

        // Only include fields that are not undefined
        const filteredUpdate = Object.fromEntries(
            Object.entries(updatedPost).filter(([_, value]) => value !== undefined)
        );

        console.log('Attempting to update with:', filteredUpdate);

        await updateDoc(postDoc, filteredUpdate);
        
        // Verify the update
        const verifyUpdate = await getDoc(postDoc);
        console.log('Post after update:', verifyUpdate.data());
        
        console.log('Post updated successfully');
        res.redirect(`/admin/posts/${req.params.id}`);
    } catch (error) {
        console.error('Error updating post:', error);
        res.render('admin/edit-post', { 
            error: 'Failed to update post',
            post: { ...req.body, id: req.params.id }
        });
    }
});

export const adminRouter = router;
