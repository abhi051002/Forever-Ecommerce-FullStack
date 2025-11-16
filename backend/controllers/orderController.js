// src/controllers/order.controller.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import sendMail from "../config/sendMail.js";

import { userOrderTemplate } from "../templates/userOrderTemplate.js";
import { adminOrderTemplate } from "../templates/adminOrderTemplate.js";
import {
  subjectForStatus,
  renderStatusEmail,
} from "../templates/orderStatusEmails.js";
import orderTimelineModel from "../models/orderTimelineModel.js";
import { CANCEL_CUTOFF, STATUS_FLOW, STATUS_RANK, TERMINAL_STATUSES } from "../config/orderStatus.js";

const currency = "usd";
const deliveryCharge = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ----------------------------------------------
   Helpers
------------------------------------------------*/

// ⬇️ Deduct stock after order (per-size)
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

const appendTimeline = async ({
  orderId,
  status,
  note,
  actorType = "system",
  actorId,
  meta,
}) => {
  // Guard unknown statuses
  if (!STATUS_FLOW.includes(status)) {
    throw new Error(`Invalid status "${status}"`);
  }

  // Forward-only guard at timeline level (defense in depth)
  const last = await orderTimelineModel
    .findOne({ orderId })
    .sort({ createdAt: -1 });
  if (last && STATUS_RANK[status] < STATUS_RANK[last.status]) {
    throw new Error(`Cannot move from "${last.status}" back to "${status}"`);
  }

  await orderTimelineModel.create({
    orderId,
    status,
    note,
    actorType,
    actorId,
    meta,
  });
};

// ✨ Seed initial timeline on order create
const seedPlacedTimeline = async (order, user) => {
  await appendTimeline({
    orderId: order._id,
    status: "Order Placed",
    note: "Order created",
    actorType: "system",
    actorId: user?._id?.toString?.(),
  });
};

/* ----------------------------------------------
               ⭐ COD ORDER
------------------------------------------------*/
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const user = await userModel.findById(userId);

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      address,
      status: "Order Placed",
    });

    // ✨ timeline
    await seedPlacedTimeline(newOrder, user);

    // ⬇️ Deduct stock immediately for COD (your existing behavior)
    await updateProductStock(items);

    // Empty cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Emails
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

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      address,
      status: "Order Placed",
    });

    // ✨ timeline
    await seedPlacedTimeline(newOrder, user);

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

    const line_items = [
      ...items.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency,
          product_data: { name: "Delivery Charges" },
          unit_amount: deliveryCharge * 100,
        },
        quantity: 1,
      },
    ];

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
      if (!order)
        return res.json({ success: false, message: "Order not found" });

      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // ⬇️ Deduct stock after successful payment
      await updateProductStock(order.items);

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      // Optional: add a timeline note (status stays the same)
      // await appendTimeline({ orderId, status: order.status, note: "Stripe payment confirmed" });

      return res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      // Optional: also delete timeline entries for this orderId if you want a clean slate
      // await orderTimelineModel.deleteMany({ orderId });
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

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      address,
      status: "Order Placed",
    });

    // ✨ timeline
    await seedPlacedTimeline(newOrder, user);

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
      if (!order)
        return res.json({ success: false, message: "Order not found" });

      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });

      // ⬇️ Deduct stock
      await updateProductStock(order.items);

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      // Optional: timeline payment note
      // await appendTimeline({ orderId: order._id, status: order.status, note: "Razorpay payment confirmed" });

      return res.json({ success: true, message: "Payment successful" });
    }

    res.json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
      ⭐ ADMIN — ALL ORDERS (search/filter/pagination)
------------------------------------------------*/
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

    if (search.trim() !== "") {
      query.$or = [
        { "address.firstName": { $regex: search, $options: "i" } },
        { "address.lastName": { $regex: search, $options: "i" } },
        { "address.phone": { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
      ];
    }

    if (status.trim() !== "") query.status = status;
    if (paymentMethod.trim() !== "") query.paymentMethod = paymentMethod;

    const total = await orderModel.countDocuments(query);

    const orders = await orderModel
      .find(query)
      .sort({ date: -1 })
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
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ----------------------------------------------
      ⭐ ADMIN — UPDATE ORDER STATUS (forward-only)
------------------------------------------------*/
const updateStatus = async (req, res) => {
  try {
    const {
      orderId,
      status,
      note,
      meta,
      actorType = "admin",
      actorId,
    } = req.body;

    if (!STATUS_FLOW.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (TERMINAL_STATUSES.has(order.status) && status !== order.status) {
      return res.json({
        success: false,
        message: `Order is ${order.status}. Further changes are not allowed.`,
      });
    }

    if (
      status === "Cancelled" &&
      STATUS_RANK[order.status] >= STATUS_RANK[CANCEL_CUTOFF]
    ) {
      return res.json({
        success: false,
        message: `Cannot cancel once order is ${CANCEL_CUTOFF} or later.`,
      });
    }

    if (STATUS_RANK[status] < STATUS_RANK[order.status]) {
      return res.json({
        success: false,
        message: `Cannot move from "${order.status}" back to "${status}"`,
      });
    }

    // Update order current status
    order.status = status;
    await order.save();

    // ✨ Append timeline
    await appendTimeline({
      orderId,
      status,
      note,
      meta,
      actorType,
      actorId,
    });

    // Email user
    const user = await userModel.findById(order.userId);
    if (user) {
      const subject = subjectForStatus(status);
      const html = renderStatusEmail({
        user,
        order,
        status,
        note, // from req.body
        meta, // from req.body (courier/awb/location)
      });
      await sendMail(user.email, subject, html);
    }

    res.json({ success: true, message: "Order status updated & email sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Invalid orderId" });
    }

    const { page = 1, limit = 20, status, sort = "asc" } = req.query;

    const q = { orderId };
    if (status) {
      if (!STATUS_FLOW.includes(status)) {
        return res.json({ success: false, message: "Invalid status filter" });
      }
      q.status = status;
    }

    const _page = Math.max(1, Number(page));
    const _limit = Math.max(1, Number(limit));
    const skip = (_page - 1) * _limit;
    const sortObj = { createdAt: sort === "desc" ? -1 : 1 };

    const [items, total] = await Promise.all([
      orderTimelineModel.find(q).sort(sortObj).skip(skip).limit(_limit).lean(),
      orderTimelineModel.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: {
        orderId,
        page: _page,
        limit: _limit,
        total,
        items,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

/** GET /order/:orderId/timeline/current
 *  Response: { success, data: { orderId, current } }
 */
const getCurrentOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Invalid orderId" });
    }

    const last = await orderTimelineModel
      .findOne({ orderId })
      .sort({ createdAt: -1 })
      .lean();

    if (!last) {
      return res.json({ success: false, message: "No timeline found" });
    }

    return res.json({ success: true, data: { orderId, current: last } });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};


const userUpdateStatus = async (req, res) => {
  try {
    const {
      orderId,
      status,
      note,
      meta,
      actorType = "user",
      actorId,
    } = req.body;

    if (! status === 'Cancelled') {
      return res.json({ success: false, message: "Invalid status" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (TERMINAL_STATUSES.has(order.status) && status !== order.status) {
      return res.json({
        success: false,
        message: `Order is ${order.status}. Further changes are not allowed.`,
      });
    }

    if (
      status === "Cancelled" &&
      STATUS_RANK[order.status] >= STATUS_RANK[CANCEL_CUTOFF]
    ) {
      return res.json({
        success: false,
        message: `Cannot cancel once order is ${CANCEL_CUTOFF} or later.`,
      });
    }

    if (STATUS_RANK[status] < STATUS_RANK[order.status]) {
      return res.json({
        success: false,
        message: `Cannot move from "${order.status}" back to "${status}"`,
      });
    }

    // Update order current status
    order.status = status;
    await order.save();

    // ✨ Append timeline
    await appendTimeline({
      orderId,
      status,
      note,
      meta,
      actorType,
      actorId,
    });

    // Email user
    const user = await userModel.findById(order.userId);
    if (user) {
      const subject = subjectForStatus(status);
      const html = renderStatusEmail({
        user,
        order,
        status,
        note, // from req.body
        meta, // from req.body (courier/awb/location)
      });
      await sendMail(user.email, subject, html);
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
  getOrderTimeline,
  getCurrentOrderStatus,
  userUpdateStatus
};
