export const orderStatusTemplate = (user, order, newStatus) => {
  return `
    <div style="font-family: Arial, sans-serif; padding:20px; background:#f7f7f7;">
      <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
        
        <h2 style="color:#4CAF50;">Your Order Status Updated</h2>

        <p>Hello <strong>${user.name}</strong>,</p>

        <p>Your order <strong>#${order._id}</strong> status has been updated.</p>

        <p style="font-size:16px;">
          <strong>New Status:</strong> 
          <span style="color:#4CAF50;">${newStatus}</span>
        </p>

        <h3>Order Summary:</h3>
        <ul>
          ${order.items
            .map(
              (item) =>
                `<li>${item.name} — Qty: ${item.quantity} — Size: ${item.size}</li>`
            )
            .join("")}
        </ul>

        <p><strong>Total Amount:</strong> $${order.amount}</p>

        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>

        <br />

        <p>We will keep you updated on the progress of your order.</p>
        <p>Thank you for shopping with us! ❤️</p>

        <hr />
        <p style="font-size:12px; color:gray;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    </div>
  `;
};
