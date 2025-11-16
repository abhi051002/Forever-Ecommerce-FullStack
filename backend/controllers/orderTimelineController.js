import mongoose from "mongoose";
import orderTimelineModel from "../models/orderTimeline.model.js";
import { STATUS_FLOW, STATUS_RANK } from "../config/orderStatus.js";

const { ObjectId } = mongoose.Types;

/** Validate Mongo ObjectId */
const assertObjectId = (id, name = "id") => {
  if (!ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${name}`);
    err.status = 400;
    throw err;
  }
};

/** GET /order/:orderId/timeline
 *  Query: page=1, limit=20, status=<optional>, sort=asc|desc (default asc by createdAt)
 */
export const getOrderTimeline = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    assertObjectId(orderId, "orderId");

    const {
      page = 1,
      limit = 20,
      status,
      sort = "asc",
    } = req.query;

    const q = { orderId };
    if (status) {
      if (!STATUS_FLOW.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }
      q.status = status;
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
    const sortObj = { createdAt: sort === "desc" ? -1 : 1 };

    const [items, total] = await Promise.all([
      orderTimelineModel
        .find(q)
        .sort(sortObj)
        .skip(skip)
        .limit(Math.max(1, Number(limit)))
        .lean(),
      orderTimelineModel.countDocuments(q),
    ]);

    res.json({
      orderId,
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /order/:orderId/timeline/current
 *  Returns the latest status entry for this order
 */
export const getCurrentOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    assertObjectId(orderId, "orderId");

    const last = await orderTimelineModel
      .findOne({ orderId })
      .sort({ createdAt: -1 })
      .lean();

    if (!last) return res.status(404).json({ error: "No timeline found" });

    res.json({ orderId, current: last });
  } catch (err) {
    next(err);
  }
};

/** POST /order/:orderId/timeline
 *  Body: { status, note?, actorType? ("system"|"admin"|"user"), actorId?, meta?: { courier?, awb?, location? } }
 */
export const addOrderTimeline = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    assertObjectId(orderId, "orderId");

    const {
      status,
      note,
      actorType = "admin",
      actorId,
      meta,
    } = req.body || {};

    // Basic validations
    if (!status || !STATUS_FLOW.includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }
    if (actorType && !["system", "admin", "user"].includes(actorType)) {
      return res.status(400).json({ error: "Invalid actorType" });
    }

    // Optional: prevent duplicate consecutive statuses (quality-of-life)
    const last = await orderTimelineModel
      .findOne({ orderId })
      .sort({ createdAt: -1 });

    if (last && last.status === status) {
      return res
        .status(409)
        .json({ error: `Status is already "${status}"` });
    }

    // Create the entry (pre-save hook prevents backward movement)
    const doc = await orderTimelineModel.create({
      orderId,
      status,
      note,
      actorType,
      actorId,
      meta,
    });

    res.status(201).json({ message: "Timeline entry created", item: doc });
  } catch (err) {
    // Surface the model pre-save guard message as a 409
    if (err.message?.startsWith("Cannot move from")) {
      err.status = 409;
    }
    next(err);
  }
};
