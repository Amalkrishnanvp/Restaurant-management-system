const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/restaurantDB", {});
    console.log("MongoDB connected");

    // Check if admin exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin);
    } else {
      console.log("No existing admin found");
    }

    // Remove existing admin to ensure fresh creation
    await User.deleteOne({ username: "admin" });
    console.log("Existing admin removed (if any)");

    // Create new admin with plain password (pre-save hook will hash it)
    const password = "admin123";
    const admin = new User({
      username: "admin",
      password: password, // Plain password
      role: "admin",
    });
    await admin.save();
    console.log("Admin user created successfully");

    // Verify the created user
    const createdAdmin = await User.findOne({ username: "admin" });
    console.log("Verified created admin:", createdAdmin);

    // Verify password match
    const isMatch = await bcrypt.compare(password, createdAdmin.password);
    console.log("Password match for 'admin123' after creation:", isMatch);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin();
