import { MongoClient } from "mongodb";

const source = new MongoClient("mongodb+srv://rabinbhattarai646:jz6IMaAyU3biXegt@cluster0.iigm7.mongodb.net/");
const target = new MongoClient("mongodb+srv://khandbarirudraksha_db_user:NUhWs85JwyAJoioa@cluster0.7ve38dq.mongodb.net/");

async function migrate() {
    await source.connect();
    await target.connect();

    const sourceDb = source.db("test");
    const targetDb = target.db("test");

    // Get all collections from source
    const sourceCollections = await sourceDb.listCollections().toArray();

    // Get all collections from target
    const targetCollections = await targetDb.listCollections().toArray();
    const targetCollectionNames = new Set(
        targetCollections.map(col => col.name)
    );

    for (const col of sourceCollections) {
        const collectionName = col.name;

        // 🚫 Skip if collection already exists
        if (targetCollectionNames.has(collectionName)) {
            console.log(`⏭ Skipping existing collection: ${collectionName}`);
            continue;
        }

        console.log(`🚀 Migrating collection: ${collectionName}`);

        const data = await sourceDb
            .collection(collectionName)
            .find({})
            .toArray();

        if (data.length > 0) {
            await targetDb
                .collection(collectionName)
                .insertMany(data);
        }
    }

    console.log("✅ Migration complete (existing collections skipped)");

    await source.close();
    await target.close();
}

migrate().catch(console.error);
