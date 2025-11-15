export const adminOrderTemplate = (order, items, user) => {
  const itemTable = `
    <table border="1" cellspacing="0" cellpadding="8"
      style="border-collapse: collapse; width: 100%; font-size: 15px;">
      
      <thead>
        <tr style="background: #f2f2f2;">
          <th align="left">Product</th>
          <th align="center">Size</th>
          <th align="center">Qty</th>
          <th align="right">Price</th>
          <th align="right">Total</th>
        </tr>
      </thead>

      <tbody>
        ${items
          .map(
            (i) => `
          <tr>
            <td>${i.name}</td>
            <td align="center">${i.size || "-"}</td>
            <td align="center">${i.quantity}</td>
            <td align="right">$${i.price}</td>
            <td align="right">$${(i.price * i.quantity).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  return `
    <div style="font-family: Arial, sans-serif; padding: 15px;">
      
      <h2 style="color: #444;">🚀 New Order Received</h2>

      <p><b>User Email:</b> ${user.email}</p>
      <p><b>User Name:</b> ${user.name || "N/A"}</p>

      <p>
        <b>Order ID:</b> ${order._id}<br/>
        <b>Date:</b> ${new Date(order.date).toLocaleString()}<br/>
        <b>Payment Method:</b> ${order.paymentMethod}<br/>
        <b>Payment Status:</b> ${order.payment ? "Paid" : "Pending"}<br/>
      </p>

      <h3 style="margin-top: 20px;">Order Details</h3>
      ${itemTable}

      <p style="margin-top: 20px; font-size: 16px;">
        <b>Total Amount:</b> $${order.amount}
      </p>

      <h3 style="margin-top: 20px;">Delivery Address</h3>
      <p style="line-height: 1.6;">
        ${order.address.name} <br/>
        ${order.address.street}, <br/>
        ${order.address.city}, ${order.address.state} - ${order.address.zip} <br/>
        <b>Phone:</b> ${order.address.phone}
      </p>

      <p style="margin-top: 25px; font-size: 14px; color: #666;">
        Please process the order in the admin panel.
      </p>

    </div>
  `;
};
