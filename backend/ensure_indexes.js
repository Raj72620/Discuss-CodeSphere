const mongoose = require('mongoose');
require('dotenv').config();

const ensureIndexes = async () => {
    try {
        console.log('Connecting to DB for index check...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        const Post = require('./models/Post');

        console.log('Ensuring indexes for Post model...');
        await Post.init();
        await Post.createIndexes();

        const indexes = await Post.collection.indexes();
        console.log('✅ Indexes verified:', indexes.map(i => i.name));

    } catch (err) {
        console.error('❌ Error ensuring indexes:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
};

ensureIndexes();
