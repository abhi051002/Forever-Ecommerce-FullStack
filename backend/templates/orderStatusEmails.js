// src/templates/orderStatusEmails.js
const currencySymbol = "₹"; // or "$" based on your store
const formatAmount = (n) => `${currencySymbol}${Number(n || 0).toFixed(2)}`;
const formatDateTime = (ts) =>
  new Date(ts).toLocaleString(); // adjust locale/timezone if needed

const renderItemsList = (order) =>
  (order.items || [])
    .map(
      (item) =>
        `<li>${item.name} — Qty: ${item.quantity} — Size: ${item.size}</li>`
    )
    .join("");

const baseShell = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; padding:20px; background:#f7f7f7;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:10px;">
      <h2 style="color:#111;margin:0 0 12px 0;">${title}</h2>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:12px; color:#666; margin:0;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
`;

const orderHeader = (user, order) => `
  <p style="margin:0 0 8px 0;">Hello <strong>${user?.name || "Customer"}</strong>,</p>
  <p style="margin:0 0 12px 0;">Order <strong>#${order?._id}</strong></p>
`;

const orderSummary = (order) => `
  <h3 style="margin:16px 0 8px 0;">Order Summary</h3>
  <ul style="margin:0 0 8px 18px;padding:0;line-height:1.6;">${renderItemsList(order)}</ul>
  <p style="margin:6px 0;"><strong>Total:</strong> ${formatAmount(order?.amount)}</p>
  <p style="margin:6px 0;"><strong>Date:</strong> ${formatDateTime(order?.date)}</p>
`;

const noteBlock = (note) =>
  note
    ? `<p style="margin:12px 0 0 0;"><strong>Note:</strong> ${note}</p>`
    : "";

const logisticsBlock = (meta) => {
  if (!meta?.courier && !meta?.awb && !meta?.location) return "";
  return `
    <h3 style="margin:16px 0 8px 0;">Shipment Details</h3>
    <table style="border-collapse:collapse;width:100%;background:#fafafa;border:1px solid #eee;border-radius:8px;">
      <tbody>
        ${
          meta?.courier
            ? `<tr><td style="padding:10px;border-bottom:1px solid #eee;"><strong>Courier</strong></td><td style="padding:10px;border-bottom:1px solid #eee;">${meta.courier}</td></tr>`
            : ""
        }
        ${
          meta?.awb
            ? `<tr><td style="padding:10px;border-bottom:1px solid #eee;"><strong>AWB / Tracking</strong></td><td style="padding:10px;border-bottom:1px solid #eee;">${meta.awb}</td></tr>`
            : ""
        }
        ${
          meta?.location
            ? `<tr><td style="padding:10px;"><strong>Location</strong></td><td style="padding:10px;">${meta.location}</td></tr>`
            : ""
        }
      </tbody>
    </table>
    <p style="font-size:13px;color:#666;margin:8px 0 0 0;">You can use the tracking number on the courier’s website.</p>
  `;
};

/* --------- Status-specific bodies ---------- */

const packedEmail = (user, order, { note }) =>
  baseShell(
    "Your order is packed 🎁",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">Good news! Your order has been packed and will be shipped soon.</p>
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

const shippedEmail = (user, order, { note, meta }) =>
  baseShell(
    "Your order has shipped 🚚",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">Your package is on the way.</p>
    ${logisticsBlock(meta)}
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

const ofdEmail = (user, order, { note, meta }) =>
  baseShell(
    "Out for delivery 📦",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">Your order is out for delivery. Please keep your phone available.</p>
    ${logisticsBlock(meta)}
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

const deliveredEmail = (user, order, { note }) =>
  baseShell(
    "Delivered ✅",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">We’re happy to let you know your order has been delivered.</p>
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

const cancelledEmail = (user, order, { note }) =>
  baseShell(
    "Order cancelled ❌",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">Your order has been cancelled. If you’ve paid already, any refund will be processed as per our policy.</p>
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

const genericEmail = (user, order, newStatus, { note, meta }) =>
  baseShell(
    "Order status update",
    `
    ${orderHeader(user, order)}
    <p style="margin:0 0 8px 0;">Your order status has been updated to <strong>${newStatus}</strong>.</p>
    ${logisticsBlock(meta)}
    ${noteBlock(note)}
    ${orderSummary(order)}
  `
  );

/* --------- Subject + renderer ---------- */

export const subjectForStatus = (status) => {
  switch (status) {
    case "Packing":
      return "Your order is packed";
    case "Order Shipped":
      return "Your order has shipped";
    case "Out for Delivery":
      return "Your order is out for delivery";
    case "Delivered":
      return "Your order has been delivered";
    case "Cancelled":
      return "Your order has been cancelled";
    default:
      return `Order status updated: ${status}`;
  }
};

export const renderStatusEmail = ({ user, order, status, note, meta }) => {
  switch (status) {
    case "Packing":
      return packedEmail(user, order, { note });
    case "Order Shipped":
      return shippedEmail(user, order, { note, meta });
    case "Out for Delivery":
      return ofdEmail(user, order, { note, meta });
    case "Delivered":
      return deliveredEmail(user, order, { note });
    case "Cancelled":
      return cancelledEmail(user, order, { note });
    default:
      return genericEmail(user, order, status, { note, meta });
  }
};
