import { Router } from "express";
import { AuthGoogle, AuthUser, FacebookOAuthSchema, GoogleOAuthSchema, InstagramOAuthSchema } from "../middlewares";
import * as Control from "../controllers";

const route = Router();

route.get("/teams", AuthUser, Control.GetTeams);
route.get("/teams/:name", AuthUser, Control.FindTeams);

route.get("/athletics", AuthUser, Control.GetAthletics);
route.get("/athletics/:name", AuthUser, Control.FindAthletics);

route.get("/user", AuthUser, Control.GetUser);
route.put("/user", AuthUser, Control.UserUpdate);

route.get("/wallet", AuthUser, Control.GetWallet);

route.post("/google/oauth", GoogleOAuthSchema, AuthGoogle, Control.GoogleOAuth);
route.post("/facebook/oauth", FacebookOAuthSchema, Control.FacebookOAuth);
route.post("/instagram/oauth", InstagramOAuthSchema, Control.InstagramOAuth);
route.get("/logout", AuthUser, Control.Logout);

route.get("/notifications", AuthUser, Control.UserNotifications);
route.put("/notifications/mark-as-read/:id", AuthUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id", AuthUser, Control.NotificationDelete);

export default route;

