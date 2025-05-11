const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Food = require("../models/Food");
const Notification = require("../models/Notification");
const User = require("../models/User");

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");
  next();
};

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    // Validate input
    if (!foodId || !quantity || quantity < 1) {
      return res.redirect("/menu?error=Invalid input");
    }

    // Fetch food item to calculate price
    const food = await Food.findById(foodId);
    if (!food) {
      return res.redirect("/menu?error=Food item not found");
    }

    const totalPrice = food.price * parseInt(quantity);

    // Create order
    const order = new Order({
      user: req.session.userId,
      foodItems: [{ food: foodId, quantity: parseInt(quantity) }],
      totalPrice,
      status: "pending",
    });
    await order.save();

    // Create notification for user
    const userNotification = new Notification({
      user: req.session.userId,
      message: `Your order #${order._id} has been placed and is currently pending.`,
    });
    await userNotification.save();

    // Create notification for admins
    const admins = await User.find({ role: "admin" }).lean();
    const adminNotifications = admins.map((admin) => ({
      user: admin._id,
      message: `New order #${order._id} placed by user ${req.session.userId}.`,
    }));
    await Notification.insertMany(adminNotifications);

    res.redirect("/menu?success=Order placed successfully");
  } catch (error) {
    console.error("Order creation error:", error);
    res.redirect("/menu?error=Server error");
  }
});

module.exports = router;
