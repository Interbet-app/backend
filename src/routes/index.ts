import { Router } from "express";
import { AuthGoogle, AuthUser } from "../middlewares";
import { GoogleOAuth, Logout, FacebookOAuth } from "../controllers";

const route = Router();

route.post("/google/oauth", AuthGoogle, GoogleOAuth);
route.post("/facebook/oauth", FacebookOAuth);
route.get("/logout", AuthUser, Logout);

export default route;


