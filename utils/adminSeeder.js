import User from "../models/User.js";

/**
 * Automatically seeds a default admin account on startup if none exists.
 * Credentials:
 * - Username: admin
 * - Password: Admin@123
 */
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" });

    if (!adminExists) {
      console.log("Seeding: No admin account found. Creating default administrator...");
      
      const defaultAdmin = new User({
        username: "admin",
        password: "Admin@123", // Password will be hashed by the pre-save hook in User model
        role: "admin",
        memberId: null,
      });

      await defaultAdmin.save();
      console.log("================================================");
      console.log(" DEFAULT ADMIN CREATED SUCCESSFULLY");
      console.log(" Username: admin");
      console.log(" Password: Admin@123");
      console.log(" Please change this password after your first login.");
      console.log("================================================");
    } else {
      console.log("Seeding: Admin account already exists. Seeding skipped.");
    }
  } catch (error) {
    console.error("================================================");
    console.error(" ADMIN SEEDING ERROR:");
    console.error(` Error details: ${error.message}`);
    console.error("================================================");
  }
};

export default seedAdmin;
