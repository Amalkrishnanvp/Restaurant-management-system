const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");

const isAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      notifications,
      error: null,
    });
  } catch (error) {
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      error: "Server error",
    });
  }
});

router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).lean();
    const orders = await Order.find()
      .populate("user")
      .populate("foodItems.food")
      .lean();
    res.render("admin/manageUsers", {
      title: "Manage Users",
      users,
      orders,
    });
  } catch (error) {
    res.render("admin/manageUsers", {
      title: "Manage Users",
      error: "Server error",
    });
  }
});

router.get("/add-food", isAdmin, (req, res) => {
  res.render("admin/addFood", { title: "Add Food Item" });
});

router.post("/add-food", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const food = new Food({
      name,
      description,
      price,
      image: req.file ? `/images/${req.file.filename}` : null,
    });
    await food.save();
    res.redirect("/admin");
  } catch (error) {
    res.render("admin/addFood", {
      title: "Add Food Item",
      error: "Server error",
    });
  }
});

router.get("/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("foodItems.food")
      .lean();
    res.render("admin/manageOrders", {
      title: "Manage Orders",
      orders,
      error: null,
    });
  } catch (error) {
    res.render("admin/manageOrders", {
      title: "Manage Orders",
      error: "Server error",
    });
  }
});

router.post("/orders/:id/confirm", isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    ).populate("user");
    const notification = new Notification({
      user: order.user._id,
      message: `Your order #${order._id} has been confirmed.`,
    });
    await notification.save();
    res.redirect("/admin/orders");
  } catch (error) {
    res.redirect("/admin/orders");
  }
});

// POST mark notification as read
router.post("/notifications/:id/read", isAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.redirect("/admin");
  } catch (error) {
    res.redirect("/admin");
  }
});

module.exports = router;
