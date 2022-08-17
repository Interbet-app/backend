import { Router } from "express";
import { AuthGoogle, AuthUser, AuthAdmin } from "../middlewares";
import * as Control from "../controllers";
import * as Middle from "../middlewares";

const route = Router();

route.get("/bets", AuthUser, AuthAdmin, Control.GetBets);
route.post("/bets", AuthUser, Control.CreateBet);
route.get("/bets/me", AuthUser, Control.GetUserBets);
route.get("/bets/game/:id", AuthUser, AuthAdmin, Control.GetBetsByGame);
route.delete("/bets/:id/", AuthUser, AuthAdmin, Control.DeleteBet);

route.get("/games", AuthUser, Control.GetGames);
route.get("/games/full", AuthUser, Control.GamesAndOdds);
route.get("/games/:id/", AuthUser, Control.GetGame);
route.get("/games/details/:id/", AuthUser, Control.GameDetails);
route.post("/games", AuthUser, AuthAdmin, Middle.CreateGame, Control.CreateGame);
route.post("/games/process-result/:id/", AuthUser, AuthAdmin, Control.ProcessGame);
route.put("/games", AuthUser, AuthAdmin, Middle.UpdateGame, Control.UpdateGame);
route.delete("/games/:id/", AuthUser, AuthAdmin, Control.DeleteGame);

route.get("/odds", AuthUser, Control.GetOdds);
route.get("/odds/:id/", AuthUser, Control.GetOdd);
route.get("/odds/game/:id/", AuthUser, Control.OddsByGame);
route.post("/odds", AuthUser, AuthAdmin, Middle.CreateOdd, Control.CreateOdd);
route.put("/odds", AuthUser, AuthAdmin, Middle.UpdateOdd, Control.UpdateOdd);
route.delete("/odds/:id/", AuthUser, AuthAdmin, Control.DeleteOdd);

route.get("/teams", AuthUser, Control.GetTeams);
route.get("/teams/:name", AuthUser, Control.FindTeams);
route.get("/teams/info/:id/", AuthUser, Control.GetTeam);
route.post("/teams", AuthUser, AuthAdmin, Control.CreateTeam);
route.put("/teams", AuthUser, AuthAdmin, Control.UpdateTeam);
route.delete("/teams/:id/", AuthUser, AuthAdmin, Control.DeleteTeam);

route.get("/athletics", AuthUser, Control.GetAthletics);
route.get("/athletics/:name/", AuthUser, Control.FindAthletics);
route.post("/athletics", AuthUser, AuthAdmin, Control.CreateAthletic);
route.put("/athletics", AuthUser, AuthAdmin, Control.UpdateAthletic);
route.delete("/athletics/:id/", AuthUser, AuthAdmin, Control.DeleteAthletic);

route.get("/events", AuthUser, Control.GetEvents);
route.post("/events", AuthUser, AuthAdmin, Middle.CreateEvent, Control.CreateEvent);
route.delete("/events/:id/", AuthUser, AuthAdmin, Control.DeleteEvent);

route.get("/adds", AuthUser, Control.GetAdds);
route.post("/adds", AuthUser, AuthAdmin, Control.CreateAdds);
route.delete("/adds/:id/", AuthUser, AuthAdmin, Control.DeleteAdds);

route.get("/user", AuthUser, Control.GetUser);
route.put("/user", AuthUser, Control.UserUpdate);

route.get("/wallet", AuthUser, Control.GetWallet);
route.post("/wallet", AuthUser, AuthAdmin, Control.CreateWallet);
route.put("/wallet", AuthUser, AuthAdmin, Middle.UpdateWallet, Control.UpdateWallet);

route.post("/google/oauth", Middle.GoogleOAuthSchema, AuthGoogle, Control.GoogleOAuth);
route.post("/facebook/oauth", Middle.FacebookOAuthSchema, Control.FacebookOAuth);
route.post("/instagram/oauth", Middle.InstagramOAuthSchema, Control.InstagramOAuth);
route.get("/logout", AuthUser, Control.Logout);

route.get("/notifications", AuthUser, Control.UserNotifications);
route.put("/notifications/:id/", AuthUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id/", AuthUser, Control.NotificationDelete);

route.get("/maintenances/me", AuthUser, Control.UserMaintenances);
route.get("/maintenances", AuthUser, AuthAdmin, Control.GetMaintenances);
route.get("/maintenances/:group/", AuthUser, AuthAdmin, Control.FindGroupMaintenances);
route.post("/maintenances", AuthUser, AuthAdmin, Middle.CreateMaintenance, Control.CreateMaintenance);
route.delete("/maintenances/:id/", AuthUser, AuthAdmin, Control.DeleteMaintenance);

route.get("/deposits", AuthUser, Control.UserDeposits);
route.post("/deposits", AuthUser, Middle.CreateDeposit, Control.CreateDeposit);
route.post("/deposits/openpix", AuthUser, Control.CreateDepositOpenPix);

//- Callback routes
route.post("/deposits/mp/callback", Control.MercadoPagoCallback);
route.post("/deposits/complete/callback", Control.OpenPixCallback);
route.post("/deposits/receive/callback", Control.OpenPixCallback);
route.post("/deposits/expire/callback", Control.OpenPixCallback);
export default route;




