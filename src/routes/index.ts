import { Router } from "express";
import { AuthGoogle, AuthUser } from "../middlewares";
import { GoogleOAuth, Logout, FacebookOAuth, UserUpdate } from "../controllers";

const route = Router();

route.post("/google/oauth", AuthGoogle, GoogleOAuth);
route.post("/facebook/oauth", FacebookOAuth);
route.put("/user/update", AuthUser, UserUpdate);
route.get("/logout", AuthUser, Logout);

export default route;

