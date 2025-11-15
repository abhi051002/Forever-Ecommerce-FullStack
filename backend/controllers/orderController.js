import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; // <-- IMPORTANT
import Stripe from "stripe";
import razorpay from "razorpay";
import sendMail from "../config/sendMail.js";

import { userOrderTemplate } from "../templates/userOrderTemplate.js";
import { adminOrderTemplate } from "../templates/adminOrderTemplate.js";
import { orderStatusTemplate } from "../templates/orderStatusTemplate .js";

const currency = "usd";
const deliveryCharge = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ----------------------------------------------
   🔥 Helper Function — Deduct Stock After Order
------------------------------------------------*/
const updateProductStock = async (items) => {
  for (const item of items) {
    const product = await productModel.findById(item._id);

    if (!product) continue;

    const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);

    if (sizeIndex !== -1) {
      product.sizes[sizeIndex].stock -= item.quantity;

      if (product.sizes[sizeIndex].stock < 0) {
        product.sizes[sizeIndex].stock = 0;
      }
    }

    await product.save();
  }
};

/* ----------------------------------------------
               ⭐ COD ORDER
------------------------------------------------*/
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const user = await userModel.findById(userId);

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      paymentMethod: "COD",
      payment: false, // COD = paid by default
      date: Date.now(),
      address,
    });

    await newOrder.save();

    // ⬇️ Deduct stock
    await updateProductStock(items);

    // Empty cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Email
    await sendMail(
      user.email,
      "Order Placed ✔",
      userOrderTemplate(newOrder, items)
    );
    await sendMail(
      process.env.ADMIN_EMAIL,
      "New Order Received 🚀",
      adminOrderTemplate(newOrder, items, user)
    );

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
               ⭐ STRIPE ORDER
------------------------------------------------*/
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const user = await userModel.findById(userId);

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      address,
    });

    await newOrder.save();

    await sendMail(
      user.email,
      "Order Initiated - Pending Payment",
      "<p>Your order is created. Complete Stripe payment to confirm.</p>"
    );

    await sendMail(
      process.env.ADMIN_EMAIL,
      "Stripe Order Initiated",
      adminOrderTemplate(newOrder, items, user)
    );

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}&userId=${userId}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
          ⭐ VERIFY STRIPE PAYMENT
------------------------------------------------*/
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      const order = await orderModel.findById(orderId);

      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // ⬇️ Deduct stock
      await updateProductStock(order.items);

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
              ⭐ RAZORPAY ORDER
------------------------------------------------*/
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const user = await userModel.findById(userId);

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      address,
    });

    await newOrder.save();

    await sendMail(
      user.email,
      "Order Created - Wait for Payment",
      "<p>Complete payment to confirm.</p>"
    );
    await sendMail(
      process.env.ADMIN_EMAIL,
      "New Razorpay Order",
      adminOrderTemplate(newOrder, items, user)
    );

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
         ⭐ VERIFY RAZORPAY PAYMENT
------------------------------------------------*/
const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const order = await orderModel.findById(orderInfo.receipt);

      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });

      // ⬇️ Deduct stock
      await updateProductStock(order.items);

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({ success: true, message: "Payment successful" });
    }

    res.json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
      ⭐ ADMIN — ALL ORDERS
------------------------------------------------*/
// ⭐ ADMIN — ALL ORDERS WITH SEARCH + FILTER + PAGINATION
const allOrders = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      paymentMethod = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // 🔍 Search by Name, Email, Phone, City (inside address)
    if (search.trim() !== "") {
      query.$or = [
        { "address.firstName": { $regex: search, $options: "i" } },
        { "address.lastName": { $regex: search, $options: "i" } },
        { "address.phone": { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by Order Status
    if (status.trim() !== "") query.status = status;

    // Filter by Payment Method
    if (paymentMethod.trim() !== "") query.paymentMethod = paymentMethod;

    const total = await orderModel.countDocuments(query);

    const orders = await orderModel
      .find(query)
      .sort({ date: -1 }) // newest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
      ⭐ USER — THEIR ORDERS
------------------------------------------------*/
const usersOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
      ⭐ ADMIN — UPDATE ORDER STATUS
------------------------------------------------*/
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Update order
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Get user info for email
    const user = await userModel.findById(updatedOrder.userId);
    if (user) {
      await sendMail(
        user.email,
        `Your Order Status Updated`,
        orderStatusTemplate(user, updatedOrder, status)
      );
    }

    res.json({ success: true, message: "Order status updated & email sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  verifyStripe,
  verifyRazorpay,
  allOrders,
  usersOrders,
  updateStatus,
};
