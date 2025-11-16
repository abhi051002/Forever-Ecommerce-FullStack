import userModel from "../models/userModel.js";

export const getMe = async (req, res) => {
  const user = await userModel.findById(req.body.userId).select("-password -otp -otpExpiry");
  if (!user) return res.json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

export const updateName = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.json({ success: false, message: "Name is required" });
  const user = await userModel.findByIdAndUpdate(
    req.body.userId,
    { name: name.trim() },
    { new: true, select: "-password -otp -otpExpiry" }
  );
  res.json({ success: true, user });
};
