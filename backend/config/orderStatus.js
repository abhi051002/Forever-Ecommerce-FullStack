export const STATUS_FLOW = [
    "Order Placed",
    "Packing",
    "Order Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];
  
  export const STATUS_RANK = STATUS_FLOW.reduce((acc, s, i) => {
    acc[s] = i; 
    return acc;
  }, {});
  
  export const TERMINAL_STATUSES = new Set(["Delivered", "Cancelled"]);
  export const CANCEL_CUTOFF = "Order Shipped";