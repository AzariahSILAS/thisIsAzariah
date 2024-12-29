import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxLength: [1000, 'Comment cannot be longer than 1000 characters']
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
        maxLength: [50, 'Author name cannot be longer than 50 characters']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isApproved: {
        type: Boolean,
        default: true  // Set to false if you want to moderate comments before they appear
    },
    likes: {
        type: Number,
        default: 0
    }
});

// Add indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 });

// Virtual for timeAgo
commentSchema.virtual('timeAgo').get(function() {
    const seconds = Math.floor((new Date() - this.createdAt) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
});

export const Comment = mongoose.model('Comment', commentSchema);
