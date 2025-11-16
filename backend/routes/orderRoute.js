import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  usersOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  getOrderTimeline,
  getCurrentOrderStatus,
  userUpdateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Addmin Features
orderRouter.get("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/user-status", userUpdateStatus);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Features
orderRouter.post("/userorders", authUser, usersOrders);

// Verify Payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

orderRouter.get("/:orderId/timeline", getOrderTimeline);
orderRouter.get("/:orderId/timeline/current", getCurrentOrderStatus);

export default orderRouter;
