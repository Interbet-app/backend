import { Router } from "express";
import { AuthUser } from "../middlewares";
import { Logout } from "../controllers";

const route = Router();
route.get("/logout", AuthUser, Logout);

export default route;
