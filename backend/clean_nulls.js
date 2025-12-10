
const mongoose = require('mongoose');
require('dotenv').config();

const cleanDB = async () => {
    try {
        console.log('Connecting to DB to clean null keys...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const collection = mongoose.connection.db.collection('conversations');

        // Find documents with null conversationKey
        const badDocs = await collection.find({ conversationKey: null }).toArray();
        console.log(`Found ${badDocs.length} conversations with null keys.`);

        for (const doc of badDocs) {
            if (doc.participants && doc.participants.length > 0) {
                const sortedIds = doc.participants.map(id => id.toString()).sort();
                const newKey = sortedIds.join('_');

                try {
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { conversationKey: newKey } }
                    );
                    console.log(`Fixed doc ${doc._id} -> ${newKey}`);
                } catch (err) {
                    if (err.code === 11000) {
                        // Duplicate exists, remove this bad doc
                        console.log(`Duplicate found for ${newKey}, deleting bad doc ${doc._id}`);
                        await collection.deleteOne({ _id: doc._id });
                    } else {
                        console.error('Update error:', err);
                    }
                }
            } else {
                console.log(`Doc ${doc._id} has no participants, deleting...`);
                await collection.deleteOne({ _id: doc._id });
            }
        }

        // Safety check: Ensure index exists and is correct
        try {
            await collection.createIndex({ conversationKey: 1 }, { unique: true, background: true });
            console.log('Verified unique index on conversationKey');
        } catch (idxErr) {
            console.log('Index creation note:', idxErr.message);
        }

    } catch (err) {
        console.error('Global Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    }
};

cleanDB();
