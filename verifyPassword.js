const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function verifyPassword() {
  try {
    await mongoose.connect("mongodb://localhost:27017/restaurantDB", {});
    console.log("MongoDB connected");

    const user = await User.findOne({ username: "admin" });
    if (!user) {
      console.log("Admin user not found");
      return;
    }

    const isMatch = await bcrypt.compare("admin123", user.password);
    console.log("Password match for admin123:", isMatch);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error verifying password:", error);
  }
}

verifyPassword();