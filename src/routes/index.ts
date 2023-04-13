import { Router } from "express";
import { AuthUser, AuthAdmin } from "../middlewares";
import * as Control from "../controllers";
import * as Middle from "../middlewares";
import { AuthMotionUser } from "../middlewares/motion-auth.middleware";

const route = Router();

route.get("/bets", Control.GetBets);
route.post("/bets", AuthMotionUser, Control.CreateBet);
route.get("/bets/amounts", AuthUser, AuthAdmin, Control.GetBetsSum);
route.post("/bets/multiple", Middle.MultipleBets, AuthUser, Control.CreateMultipleBets);
route.get("/bets/me", AuthMotionUser, Control.GetUserBets);
route.get("/bets/game/:id/", Middle.ID, AuthUser, AuthAdmin, Control.GetBetsByGame);
route.delete("/bets/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteBet);

route.get("/games/history", Control.GamesHistory);
route.get("/games/history/search", Control.GamesHistorySearch);
route.post("/games/history", AuthUser, AuthAdmin, Middle.CreateGameHistory, Control.GamesHistoryCreate);
route.delete("/games/history/:id/", Middle.ID, AuthUser, AuthAdmin, Control.GamesHistoryDelete);

route.get("/games", Control.GetGames);
route.post("/games", AuthUser, AuthAdmin, Middle.CreateGame, Control.CreateGame);
route.put("/games", AuthUser, AuthAdmin, Middle.UpdateGame, Control.UpdateGame);
route.get("/games/full", Control.GamesFilter);
route.get("/games/filter", Control.GamesFilter);
route.post("/games/process-result/:id/", Middle.ID, Middle.ProcessGame, AuthUser, AuthAdmin, Control.ProcessGame);
route.get("/games/details/:id/", Middle.ID, Control.GameDetails);
route.get("/games/last/team", Control.TeamLastGames);
route.get("/games/last/athletic", Control.AthleticLastGames);
route.get("/games/:id/", Middle.ID, Control.GetGame);
route.delete("/games/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteGame);

route.get("/odds", Control.GetOdds);
route.get("/odds/:id/", Middle.ID, Control.GetOdd);
route.get("/odds/game/:id/", Middle.ID, Control.OddsByGame);
route.post("/odds", AuthUser, AuthAdmin, Middle.CreateOdd, Control.CreateOdd);
route.put("/odds", AuthUser, AuthAdmin, Middle.UpdateOdd, Control.UpdateOdd);
route.delete("/odds/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteOdd);

route.get("/teams", Control.GetTeams);
route.get("/teams/:name/", Control.FindTeams);
route.get("/teams/players/:id/", Middle.ID, Control.TeamPlayers);
route.get("/teams/info/:id/", Middle.ID, Control.GetTeam);
route.post("/teams", AuthUser, AuthAdmin, Control.CreateTeam);
route.post("/teams/players", AuthUser, AuthAdmin, Control.CreatePlayer);
route.put("/teams", AuthUser, AuthAdmin, Control.UpdateTeam);
route.put("/teams/players/", AuthUser, AuthAdmin, Control.UpdatePlayer);
route.delete("/teams/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteTeam);
route.delete("/teams/players/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeletePlayer);

route.get("/players", AuthUser, AuthAdmin, Control.GetPlayers);

route.get("/athletics", Control.GetAthletics);
route.get("/athletics/:name/", Control.FindAthletics);
route.post("/athletics", AuthUser, AuthAdmin, Control.CreateAthletic);
route.put("/athletics", AuthUser, AuthAdmin, Control.UpdateAthletic);
route.delete("/athletics/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteAthletic);

route.get("/events", Control.GetEvents);
route.post("/events", AuthUser, AuthAdmin, Middle.CreateEvent, Control.CreateEvent);
route.delete("/events/:id/", AuthUser, AuthAdmin, Control.DeleteEvent);

route.get("/adds", Control.GetAdds);
route.post("/adds", AuthUser, AuthAdmin, Control.CreateAdds);
route.delete("/adds/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteAdds);

route.get("/user", AuthUser, Control.GetUser);
route.get("/user/all", Control.GetAllUsers);
route.post("/user/athletic/admin", AuthUser, AuthAdmin, Control.SetAthleticAndTeamAdminId);
route.put("/user", AuthMotionUser, Control.UserUpdate);
// route.put("/user/profile", AuthUser, Control.UserProfile);
route.get("/user/me", AuthMotionUser, Control.GetMotionUser);

route.get("/wallet", AuthUser, Control.GetWallet);
route.get("/wallet/balances", AuthUser, AuthAdmin, Control.SumBalances);
route.post("/wallet", AuthUser, AuthAdmin, Control.CreateWallet);
route.put("/wallet", AuthUser, AuthAdmin, Middle.UpdateWallet, Control.UpdateWallet);

// route.post("/google/oauth", Middle.GoogleOAuthSchema, AuthGoogle, Control.GoogleOAuth);
// route.post("/facebook/oauth", Middle.FacebookOAuthSchema, Control.FacebookOAuth);
// route.post("/instagram/oauth", Middle.InstagramOAuthSchema, Control.InstagramOAuth);
route.get("/logout", AuthUser, Control.Logout);

//- Notificações
route.get("/notifications", AuthUser, Control.UserNotifications);
route.put("/notifications/:id/", Middle.ID, AuthUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id/", Middle.ID, AuthUser, Control.NotificationDelete);

//- Administração
route.get("/maintenances/me", AuthUser, Control.UserMaintenances);
route.get("/maintenances", AuthUser, AuthAdmin, Control.GetMaintenances);
route.get("/maintenances/:group/", AuthUser, AuthAdmin, Control.FindGroupMaintenances);
route.post("/maintenances", AuthUser, AuthAdmin, Middle.CreateMaintenance, Control.CreateMaintenance);
route.delete("/maintenances/:id/", Middle.ID, AuthUser, AuthAdmin, Control.DeleteMaintenance);

//-Depósitos
route.get("/deposits", AuthUser, Control.UserDeposits);
route.get("/deposits/:id/", Middle.ID, AuthUser, Control.UserDepositDetails);
route.post("/deposits", Middle.CreateDeposit, AuthUser, Control.CreateDeposit);

//-Retiradas
route.get("/withdrawals", AuthUser, Control.UserWithdrawals);
route.post("/withdrawals", AuthUser, Control.CreateWithdrawal);

//- Classificações
route.get("/ranking/bets", Control.UsersBetsRanking);
route.get("/ranking/athletics", Control.AthleticsRanking);
route.get("/ranking/:id/", Middle.ID, Control.EventRanking);

//- Logs
route.get("/logs", AuthUser, AuthAdmin, Control.ShowLogs);
route.post("/logs/flush", AuthUser, AuthAdmin, Control.FlushLogs);

//- Feedback
route.get("/feedback", AuthUser, AuthAdmin, Control.GetAllFeedbacks);
route.post("/feedback", AuthUser, Control.CreateFeedback);

//- Callback routes
route.post("/deposits/complete/callback", Control.OpenPixCallbackComplete);
route.post("/deposits/expire/callback", Control.OpenPixCallbackExpired);

export default route;

