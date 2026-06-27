import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas
 * Catches connection issues so the server doesn't crash on startup
 */
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error("================================================");
    console.error(" MONGODB WARNING: MONGODB_URI env is not set!");
    console.error(" Check your .env file.");
    console.error("================================================");
    return false;
  }

  try {
    const conn = await mongoose.connect(dbUri);
    console.log("================================================");
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log("================================================");
    return true;
  } catch (error) {
    console.error("================================================");
    console.error(" DATABASE CONNECTION ERROR:");
    console.error(` Error details: ${error.message}`);
    console.error(" The application will start, but database queries will fail.");
    console.error("================================================");
    return false;
  }
};

export default connectDB;
