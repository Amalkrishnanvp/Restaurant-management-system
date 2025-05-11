const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const multer = require("multer");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const menuRoutes = require("./routes/menuRoutes");

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

hbs.registerHelper("if_eq", function (a, b, opts) {
  //   return a == b ? opts.fn(this) : opts.inverse(this);
  return a?.toString() === b?.toString() ? opts.fn(this) : opts.inverse(this);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "restaurant_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// View engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.set("view options", { layout: "layouts/main" }); // Set main.hbs as default layout
hbs.registerPartials(path.join(__dirname, "views/partials"));

// Pass session to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Base route
app.get("/", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  if (req.session.role === "admin") return res.redirect("/admin");
  return res.redirect("/user");
});

// Routes
app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/menu", menuRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/restaurantDB", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
