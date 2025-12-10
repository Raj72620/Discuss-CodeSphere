
const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const collection = mongoose.connection.db.collection('conversations');
        const indexes = await collection.indexes();

        console.log('Current indexes:', indexes);

        // Look for the unique index on 'participants'
        const badIndex = indexes.find(idx => idx.key && idx.key.participants === 1 && idx.unique === true);

        if (badIndex) {
            console.log('Found duplicate-causing index:', badIndex.name);
            console.log('Dropping index...');
            await collection.dropIndex(badIndex.name);
            console.log('Index dropped successfully!');
        } else {
            console.log('No problematic index found on participants.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    }
};

fixIndexes();
