const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log(
      "🔍 MONGODB_URI:",
      process.env.MONGODB_URI ? "Found" : "Not found"
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    // More detailed error info
    if (error.name === "MongoServerSelectionError") {
      console.error(
        "💡 Check your connection string and network access in MongoDB Atlas"
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;
