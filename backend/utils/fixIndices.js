
const mongoose = require('mongoose');
require('dotenv').config();

const fixIndices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const conversationCollection = collections.find(c => c.name === 'conversations');

        if (conversationCollection) {
            console.log('Found conversations collection');
            const indexes = await mongoose.connection.db.collection('conversations').indexes();
            console.log('Current indexes:', indexes);

            // Find the problematic index
            const badIndex = indexes.find(idx => idx.key.participants === 1 && idx.unique === true);

            if (badIndex) {
                console.log('Dropping bad index:', badIndex.name);
                await mongoose.connection.db.collection('conversations').dropIndex(badIndex.name);
                console.log('Dropped index successfully');
            } else {
                console.log('No bad index found');
            }
        } else {
            console.log('Conversations collection not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndices();
