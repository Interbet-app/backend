import { Router } from "express";
import { AuthAdmin } from "../middlewares";
import * as Control from "../controllers";
import * as Middle from "../middlewares";
import { AuthMotionUser } from "../middlewares/motion-auth.middleware";

const route = Router();

route.get("/bets", Control.GetBets);
route.post("/bets", AuthMotionUser, Control.CreateBet);
route.post("/bets/placeBet", Control.PlaceBet);
route.get("/bets/amounts", Control.GetBetsSum);
route.post("/bets/multiple", Middle.MultipleBets, AuthMotionUser, Control.CreateMultipleBets);
route.get("/bets/:userId/", Control.GetAnyUserBets);
route.get("/bets/user/me", AuthMotionUser, Control.GetUserBets);

route.get("/bets/game/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.GetBetsByGame);
route.delete("/bets/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteBet);

route.get("/games/history", Control.GamesHistory);
route.get("/games/history/search", Control.GamesHistorySearch);
route.post("/games/history", AuthMotionUser, AuthAdmin, Middle.CreateGameHistory, Control.GamesHistoryCreate);
route.delete("/games/history/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.GamesHistoryDelete);

route.get("/games", Control.GetGames);
route.post("/games", Middle.CreateGame, Control.CreateGame);
route.put("/games", AuthMotionUser, AuthAdmin, Middle.UpdateGame, Control.UpdateGame);
route.get("/games/full", Control.GamesFilter);
route.get("/games/filter", Control.GamesFilter);
route.post("/games/process-result/:id/", Middle.ID, Middle.ProcessGame, AuthMotionUser, AuthAdmin, Control.ProcessGame);
route.get("/games/details/:id/", Middle.ID, Control.GameDetails);
route.get("/games/last/team", Control.TeamLastGames);
route.get("/games/last/athletic", Control.AthleticLastGames);
route.get("/games/:id/", Middle.ID, Control.GetGame);
route.delete("/games/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteGame);

route.get("/odds", Control.GetOdds);
route.get("/odds/:id/", Middle.ID, Control.GetOdd);
route.get("/odds/game/:id/", Middle.ID, Control.OddsByGame);
route.post("/odds", Middle.CreateOdd, Control.CreateOdd);
route.put("/odds", AuthMotionUser, AuthAdmin, Middle.UpdateOdd, Control.UpdateOdd);
route.delete("/odds/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteOdd);

route.get("/teams", Control.GetTeams);
route.get("/teams/:name/", Control.FindTeams);
route.get("/teams/players/:id/", Middle.ID, Control.TeamPlayers);
route.get("/teams/info/:id/", Middle.ID, Control.GetTeam);
route.post("/teams", AuthMotionUser, AuthAdmin, Control.CreateTeam);
route.post("/teams/players", AuthMotionUser, AuthAdmin, Control.CreatePlayer);
route.put("/teams", AuthMotionUser, AuthAdmin, Control.UpdateTeam);
route.put("/teams/players/", AuthMotionUser, AuthAdmin, Control.UpdatePlayer);
route.delete("/teams/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteTeam);
route.delete("/teams/players/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeletePlayer);

route.get("/players", AuthMotionUser, AuthAdmin, Control.GetPlayers);

route.get("/athletics", Control.GetAthletics);
route.get("/athletics/:name/", Control.FindAthletics);
route.post("/athletics", AuthMotionUser, AuthAdmin, Control.CreateAthletic);
route.put("/athletics", AuthMotionUser, AuthAdmin, Control.UpdateAthletic);
route.delete("/athletics/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteAthletic);

route.get("/events", Control.GetEvents);
route.post("/events", AuthMotionUser, AuthAdmin, Middle.CreateEvent, Control.CreateEvent);
route.delete("/events/:id/", AuthMotionUser, AuthAdmin, Control.DeleteEvent);

route.get("/adds", Control.GetAdds);
route.post("/adds", AuthMotionUser, AuthAdmin, Control.CreateAdds);
route.delete("/adds/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteAdds);

route.get("/user", AuthMotionUser, Control.GetUser);
route.get("/user/all", Control.GetAllUsers);
route.post("/user/athletic/admin", AuthMotionUser, AuthAdmin, Control.SetAthleticAndTeamAdminId);
route.put("/user", AuthMotionUser, Control.UserUpdate);
route.post("/user/max-bet-amount", Control.UserSetMaxBet);
// route.put("/user/profile", AuthMotionUser, Control.UserProfile);
route.get("/user/me", Control.GetMotionUser);
// route.delete("/user/:id/", AuthMotionUser, Control.DeleteUser);

route.get("/wallet", AuthMotionUser, Control.GetWallet);
route.get("/wallet/balances", AuthMotionUser, AuthAdmin, Control.SumBalances);
route.post("/wallet", AuthMotionUser, AuthAdmin, Control.CreateWallet);
route.put("/wallet", AuthMotionUser, AuthAdmin, Middle.UpdateWallet, Control.UpdateWallet);

// route.post("/google/oauth", Middle.GoogleOAuthSchema, AuthGoogle, Control.GoogleOAuth);
// route.post("/facebook/oauth", Middle.FacebookOAuthSchema, Control.FacebookOAuth);
// route.post("/instagram/oauth", Middle.InstagramOAuthSchema, Control.InstagramOAuth);
route.get("/logout", AuthMotionUser, Control.Logout);

//- Notificações
route.get("/notifications", AuthMotionUser, Control.UserNotifications);
route.put("/notifications/:id/", Middle.ID, AuthMotionUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id/", Middle.ID, AuthMotionUser, Control.NotificationDelete);

//- Administração
route.get("/maintenances/me", AuthMotionUser, Control.UserMaintenances);
route.get("/maintenances", AuthMotionUser, AuthAdmin, Control.GetMaintenances);
route.get("/maintenances/:group/", AuthMotionUser, AuthAdmin, Control.FindGroupMaintenances);
route.post("/maintenances", AuthMotionUser, AuthAdmin, Middle.CreateMaintenance, Control.CreateMaintenance);
route.delete("/maintenances/:id/", Middle.ID, AuthMotionUser, AuthAdmin, Control.DeleteMaintenance);

//-Depósitos
route.get("/deposits", AuthMotionUser, Control.UserDeposits);
route.get("/deposits/:id/", Middle.ID, AuthMotionUser, Control.UserDepositDetails);
route.post("/deposits", Middle.CreateDeposit, AuthMotionUser, Control.CreateDeposit);

//-Retiradas
route.get("/withdrawals", AuthMotionUser, Control.UserWithdrawals);
route.post("/withdrawals", AuthMotionUser, Control.CreateWithdrawal);

//- Classificações
route.get("/ranking/bets", Control.UsersBetsRanking);
route.get("/ranking/athletics", Control.AthleticsRanking);
route.get("/ranking/:id/", Middle.ID, Control.EventRanking);

//- Logs
route.get("/logs", AuthMotionUser, AuthAdmin, Control.ShowLogs);
route.post("/logs/flush", AuthMotionUser, AuthAdmin, Control.FlushLogs);

//- Feedback
route.get("/feedback", AuthMotionUser, AuthAdmin, Control.GetAllFeedbacks);
route.post("/feedback", AuthMotionUser, Control.CreateFeedback);

//- Callback routes
route.post("/deposits/complete/callback", Control.OpenPixCallbackComplete);
route.post("/deposits/expire/callback", Control.OpenPixCallbackExpired);

//- Dashboard routes
route.get("/dashboard/users", Control.GetUsersBetsInfo);
route.get("/dashboard/profit", Control.GetProfit);
route.get("/dashboard/profitByGame", Control.GetTotalAmountBetByGame);
route.get("/dashboard/settings", Control.GetSettings);
route.post("/dashboard/settings/:stage", Control.SetSettings);

//- Premiações
route.post("/awards/qr-code", Control.GetAwardQrCode);
route.post("/awards/qr-code/payment", Control.ConfirmAwardPayment);

export default route;
