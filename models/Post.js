import { db } from '../config/firebase.js'; // You'll need to create this firebase config file
import { collection, doc, getDoc, setDoc, updateDoc, query, where, limit, orderBy } from 'firebase/firestore';
import slugify from 'slugify';

class Post {
    constructor(data = {}) {
        this.title = data.title || '';
        this.content = data.content || '';
        this.excerpt = data.excerpt || '';
        this.slug = data.slug || '';
        this.author = data.author || '';
        this.coverImage = data.coverImage || null;
        this.tags = data.tags || [];
        this.status = data.status || 'published';
        this.comments = data.comments || [];
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.views = data.views || 0;
    }

    // Validate and prepare data before saving
    async validate() {
        if (!this.title) throw new Error('Title is required');
        if (!this.content) throw new Error('Content is required');
        if (!this.excerpt) throw new Error('Excerpt is required');
        if (!this.author) throw new Error('Author is required');
        
        if (this.title.length > 200) throw new Error('Title cannot be longer than 200 characters');
        if (this.excerpt.length > 500) throw new Error('Excerpt cannot be longer than 500 characters');
        
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });
        
        this.updatedAt = new Date();
    }

    // Save post to Firestore
    async save() {
        await this.validate();
        const postsRef = collection(db, 'posts');
        await setDoc(doc(postsRef, this.slug), this.toJSON());
        return this;
    }

    // Convert class instance to plain object
    toJSON() {
        return {
            title: this.title,
            content: this.content,
            excerpt: this.excerpt,
            slug: this.slug,
            author: this.author,
            coverImage: this.coverImage,
            tags: this.tags,
            status: this.status,
            comments: this.comments,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            views: this.views
        };
    }

    // Get formatted date
    get formattedDate() {
        return this.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Calculate reading time
    get readingTime() {
        const wordsPerMinute = 200;
        const wordCount = this.content.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    // Increment view count
    async incrementViews() {
        this.views += 1;
        const postRef = doc(db, 'posts', this.slug);
        await updateDoc(postRef, { views: this.views });
        return this;
    }

    // Static methods
    static async findBySlug(slug) {
        const docRef = doc(db, 'posts', slug);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return new Post(docSnap.data());
    }

    static async findRelated(tags, currentSlug, limit = 3) {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('tags', 'array-contains-any', tags),
            where('slug', '!=', currentSlug),
            orderBy('createdAt', 'desc'),
            limit(limit)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => new Post(doc.data()));
    }
}

export default Post;
