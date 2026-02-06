import mongoose from "mongoose";
import Product from "./models/product.js"; 
// 👆 adjust path to your Product model

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://khandbarirudraksha_db_user:NUhWs85JwyAJoioa@cluster0.7ve38dq.mongodb.net/";

async function backfillProductTimestamps() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected");

    console.log("⏳ Backfilling createdAt & updatedAt from _id...");

    const result = await Product.updateMany(
      { createdAt: { $exists: false } }, // only old docs
      [
        {
          $set: {
            createdAt: { $toDate: "$_id" },
            updatedAt: { $toDate: "$_id" },
          },
        },
      ]
    );

    console.log("✅ Migration completed");
    console.log("🧾 Matched documents:", result.matchedCount);
    console.log("🧾 Modified documents:", result.modifiedCount);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

backfillProductTimestamps();