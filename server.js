import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { postRouter } from './routes/posts.js';
import { adminRouter } from './routes/admin.js';
import dotenv from 'dotenv';
import methodOverride from 'method-override';

dotenv.config(); 

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Session:', req.session);
    next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Routes
app.use('/', postRouter);
app.use('/admin', adminRouter);

// Error handling
app.use((req, res) => {
    console.log('404 Error:', req.url);
    res.status(404).render('error', { error: 'Page not found' });
});

app.use('/uploads', express.static('public/uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Views directory: ${join(__dirname, 'views')}`);
});   
 