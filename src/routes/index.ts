import { Router } from "express";
import { AuthGoogle, AuthUser, AuthAdmin } from "../middlewares";
import * as Control from "../controllers";
import * as Middle from "../middlewares";

const route = Router();

route.get("/teams", AuthUser, Control.GetTeams);
route.get("/teams/:name", AuthUser, Control.FindTeams);
route.post("/teams", AuthUser, AuthAdmin, Control.CreateTeam);

route.get("/athletics", AuthUser, Control.GetAthletics);
route.get("/athletics/:name/", AuthUser, Control.FindAthletics);
route.post("/athletics", AuthUser, AuthAdmin, Control.CreateAthletic);

route.get("/events", AuthUser, Control.GetEvents);
route.get("/adds", AuthUser, Control.GetAdds);

route.get("/user", AuthUser, Control.GetUser);
route.put("/user", AuthUser, Control.UserUpdate);

route.get("/wallet", AuthUser, Control.GetWallet);

route.post("/google/oauth", Middle.GoogleOAuthSchema, AuthGoogle, Control.GoogleOAuth);
route.post("/facebook/oauth", Middle.FacebookOAuthSchema, Control.FacebookOAuth);
route.post("/instagram/oauth", Middle.InstagramOAuthSchema, Control.InstagramOAuth);
route.get("/logout", AuthUser, Control.Logout);

route.get("/notifications", AuthUser, Control.UserNotifications);
route.put("/notifications/:id/", AuthUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id/", AuthUser, Control.NotificationDelete);

route.get("/maintenances", AuthUser, AuthAdmin, Control.GetMaintenances);
route.post("/maintenances", AuthUser, AuthAdmin, Middle.CreateMaintenance, Control.CreateMaintenance);
route.delete("/maintenances/:id/", AuthUser, AuthAdmin, Control.DeleteMaintenance);

export default route;

