const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

router.get("/login", (req, res) => {
  const logoutSuccess = req.query.logout === "success";
  res.render("login", { title: "Login", logoutSuccess });
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    const user = await User.findOne({ username });
    console.log("User found:", user);

    if (!user) {
      console.log("No user found for username:", username);
      return res.render("login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    const passwordMatch = await user.comparePassword(password);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("Password mismatch for user:", username);
      return res.render("login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    req.session.userId = user._id;
    req.session.role = user.role;
    console.log("Session set:", req.session);

    if (user.role === "admin") {
      console.log("Redirecting to /admin for admin user");
      return res.redirect("/admin");
    }
    console.log("Redirecting to /user for non-admin user");
    return res.redirect("/user");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { title: "Login", error: "Server error" });
  }
});

router.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.render("login", {
        title: "Login",
        error: "Failed to log out",
      });
    }
    console.log("Session destroyed, user logged out");
    res.redirect("/login?logout=success");
  });
});

// GET register page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", error: null });
});

// POST register user
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        error: "Username or email already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "user", // Default to "user" if not provided
    });

    await user.save();

    // Log the user in by setting session
    req.session.userId = user._id;
    req.session.role = user.role;

    // Redirect based on role
    if (user.role === "admin") {
      return res.redirect("/admin");
    }
    return res.redirect("/user");
  } catch (err) {
    console.error("Registration error:", err);
    res.render("register", {
      title: "Register",
      error: "An error occurred. Please try again.",
    });
  }
});

module.exports = router;

