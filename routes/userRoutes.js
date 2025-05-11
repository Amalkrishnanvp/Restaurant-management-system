const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Notification = require("../models/Notification");

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");
  if (req.session.role === "admin") return res.redirect("/admin");
  next();
};

// GET user dashboard
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId })
      .populate("foodItems.food")
      .lean();
    const notifications = await Notification.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.render("userDashboard", {
      title: "User Dashboard",
      orders,
      notifications,
      error: null,
    });
  } catch (error) {
    res.render("userDashboard", {
      title: "User Dashboard",
      error: "Server error",
    });
  }
});

// POST mark notification as read
router.post("/notifications/:id/read", isAuthenticated, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.redirect("/user");
  } catch (error) {
    res.redirect("/user");
  }
});

module.exports = router;
