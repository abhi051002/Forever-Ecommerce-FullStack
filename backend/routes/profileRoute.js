// routes/user.profile.routes.js
import express from "express";
import authUser from "../middleware/auth.js";
import { getMe, updateName } from "../controllers/profileController.js";

const profileRouter = express.Router();
profileRouter.get("/me", authUser, getMe);
profileRouter.patch("/name", authUser, updateName);
export default profileRouter;
