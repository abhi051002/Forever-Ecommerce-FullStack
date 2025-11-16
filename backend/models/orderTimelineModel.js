import mongoose from "mongoose";
import { STATUS_FLOW, STATUS_RANK } from "../config/orderStatus.js";

const orderTimelineSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order", required: true, index: true },
    status: { type: String, enum: STATUS_FLOW, required: true, index: true },
    note: { type: String },              // optional comment
    actorType: {                          // who changed it
      type: String,
      enum: ["system", "admin", "user"],
      default: "admin",
    },
    actorId: { type: String },           // adminId/userId if you have it
    meta: {
      courier: String,                   // e.g. "Delhivery"
      awb: String,                       // tracking number
      location: String,                  // "Bhubaneswar Hub"
    },
  },
  { timestamps: true }
);

// Prevent moving backwards for a given order (server-side guard)
orderTimelineSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const last = await mongoose.model("orderTimeline").findOne(
    { orderId: this.orderId },
    {},
    { sort: { createdAt: -1 } }
  );

  if (last && STATUS_RANK[this.status] < STATUS_RANK[last.status]) {
    return next(
      new Error(`Cannot move from "${last.status}" back to "${this.status}"`)
    );
  }
  next();
});

const orderTimelineModel =
  mongoose.models.orderTimeline ||
  mongoose.model("orderTimeline", orderTimelineSchema);

export default orderTimelineModel;
