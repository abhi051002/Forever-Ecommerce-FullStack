import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Unauthorized Access" });
    }
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({ success: false, message: "Unauthorized Access" });
    }
    next();
    // return res.json({ success: true, message: "Access granted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
