const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodItems: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
      quantity: { type: Number, default: 1 },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "confirmed"],
    default: "pending",
  },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
