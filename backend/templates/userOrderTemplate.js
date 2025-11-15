export const userOrderTemplate = (order, items) => {

  const itemTable = `
    <table border="1" cellspacing="0" cellpadding="8" 
      style="border-collapse: collapse; width: 100%; font-size: 15px;">
      
      <thead>
        <tr style="background: #f5f5f5;">
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
      
      <h2 style="color: #333;">Thank you for your order! 🎉</h2>
      <p>Your order has been placed successfully.</p>

      <p>
        <b>Order ID:</b> ${order._id}<br/>
        <b>Date:</b> ${new Date(order.date).toLocaleString()}
      </p>

      <h3 style="margin-top: 20px;">Order Summary</h3>
      ${itemTable}

      <p style="margin-top: 20px; font-size: 16px;">
        <b>Total Amount:</b> $${order.amount}
      </p>

      <p style="margin-top: 25px; font-size: 14px; color: #555;">
        We will notify you once your order is packed and shipped.
        <br/>
        Thank you for shopping with us ❤️
      </p>

    </div>
  `;
};
