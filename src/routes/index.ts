import { Router } from "express";
import { AuthAdmin, AuthUser } from "../middlewares";
import * as Control from "../controllers";
import * as Middle from "../middlewares";

const route = Router();

route.get("/bets", Control.GetBets);
route.get("/bets/amounts", AuthAdmin, Control.GetBetsSum);
route.get("/bets/:userId/", AuthAdmin, Control.GetAnyUserBets);
route.get("/bets/user/me", AuthUser, Control.GetUserBets);
route.get("/bets/game/:id/", Middle.ID, AuthAdmin, Control.GetBetsByGame);
route.post("/bets", AuthUser, Control.CreateBet);
route.post("/bets/newCredit/:id/", Control.NewCreditAmount);
route.post("/bets/newDebit/:id/", Control.NewDebitAmount);
route.post("/bets/cashout/:id/", Control.CashOut);
route.put("/bets/:id/", Middle.ID, Control.RefundBet);

route.get("/games/history", Control.GamesHistory);
route.get("/games/history/search", Control.GamesHistorySearch);
route.post("/games/history", AuthAdmin, Middle.CreateGameHistory, Control.GamesHistoryCreate);
route.delete("/games/history/:id/", Middle.ID, AuthAdmin, Control.GamesHistoryDelete);

route.get("/games", Control.GetGames);
route.get("/games/odds", Control.GetGamesOdds);
route.post("/games", Middle.CreateGame, Control.CreateGame);
route.put("/games", AuthAdmin, Middle.UpdateGame, Control.UpdateGame);
route.get("/games/full", Control.GamesFilter);
route.get("/games/filter", Control.GamesFilter);
route.post("/games/process-result/:id/", Middle.ID, Middle.ProcessGame, Control.ProcessGame);
route.get("/games/details/:id/", Middle.ID, Control.GameDetails);
route.get("/games/last/team", Control.TeamLastGames);
route.get("/games/last/athletic", Control.AthleticLastGames);
route.get("/games/:id/", Middle.ID, Control.GetGame);
route.delete("/games/:id/", Middle.ID, AuthAdmin, Control.DeleteGame);

route.get("/odds", Control.GetOdds);
route.get("/odds/:id/", Middle.ID, Control.GetOdd);
route.get("/odds/game/:id/", Middle.ID, Control.OddsByGame);
route.post("/odds", Middle.CreateOdd, Control.CreateOdd);
route.put("/odds", AuthAdmin, Middle.UpdateOdd, Control.UpdateOdd);
route.delete("/odds/:id/", Middle.ID, AuthAdmin, Control.DeleteOdd);

route.get("/teams", Control.GetTeams);
route.get("/teams/:name/", Control.FindTeams);
route.get("/teams/players/:id/", Middle.ID, Control.TeamPlayers);
route.get("/teams/info/:id/", Middle.ID, Control.GetTeam);
route.post("/teams", AuthAdmin, Control.CreateTeam);
route.post("/teams/players", AuthAdmin, Control.CreatePlayer);
route.put("/teams", AuthAdmin, Control.UpdateTeam);
route.put("/teams/players/", AuthAdmin, Control.UpdatePlayer);
route.delete("/teams/:id/", Middle.ID, AuthAdmin, Control.DeleteTeam);
route.delete("/teams/players/:id/", Middle.ID, AuthAdmin, Control.DeletePlayer);

route.get("/players", AuthAdmin, Control.GetPlayers);

route.get("/athletics", Control.GetAthletics);
route.get("/athletics/:name/", Control.FindAthletics);
route.post("/athletics", AuthAdmin, Control.CreateAthletic);
route.put("/athletics", AuthAdmin, Control.UpdateAthletic);
route.delete("/athletics/:id/", Middle.ID, AuthAdmin, Control.DeleteAthletic);

route.get("/events", Control.GetEvents);
route.post("/events", AuthAdmin, Middle.CreateEvent, Control.CreateEvent);
route.delete("/events/:id/", AuthAdmin, Control.DeleteEvent);

route.get("/adds", Control.GetAdds);
route.post("/adds", AuthAdmin, Control.CreateAdds);
route.delete("/adds/:id/", Middle.ID, AuthAdmin, Control.DeleteAdds);

route.get("/user", AuthUser, Control.GetUser);
route.get("/user/all", Control.GetAllUsers);
route.post("/user/athletic/admin", AuthAdmin, Control.SetAthleticAndTeamAdminId);
route.put("/user", AuthUser, Control.UserUpdate);
route.post("/user/max-bet-amount",AuthAdmin, Control.UserSetMaxBet);
route.get("/user/me", Control.SignInBetMotion);
route.get("/logout", AuthUser, Control.Logout);

//- Notificações
route.get("/notifications", AuthUser, Control.UserNotifications);
route.put("/notifications/:id/", Middle.ID, AuthUser, Control.NotificationMarkAsRead);
route.delete("/notifications/:id/", Middle.ID, AuthUser, Control.NotificationDelete);

//- Administração
route.get("/maintenances/me", AuthUser, Control.UserMaintenances);
route.get("/maintenances", AuthAdmin, Control.GetMaintenances);
route.get("/maintenances/:group/", AuthAdmin, Control.FindGroupMaintenances);
route.post("/maintenances", AuthAdmin, Middle.CreateMaintenance, Control.CreateMaintenance);
route.delete("/maintenances/:id/", Middle.ID, AuthAdmin, Control.DeleteMaintenance);

//- Classificações
route.get("/ranking/bets", Control.UsersBetsRanking);
route.get("/ranking/athletics", Control.AthleticsRanking);
route.get("/ranking/:id/", Middle.ID, Control.EventRanking);

//- Logs
route.get("/logs", AuthAdmin, Control.ShowLogs);
route.post("/logs/flush", AuthAdmin, Control.FlushLogs);

//- Feedback
route.get("/feedback", AuthAdmin, Control.GetAllFeedbacks);
route.post("/feedback", AuthUser, Control.CreateFeedback);

//- Dashboard routes
route.get("/dashboard/users", AuthAdmin, Control.GetUsersBetsInfo);
route.get("/dashboard/profit", AuthAdmin, Control.GetProfit);
route.get("/dashboard/profitByGame", AuthAdmin, Control.GetTotalAmountBetByGame);
route.get("/dashboard/settings/:stage", AuthAdmin, Control.GetSettings);
route.post("/dashboard/settings/:stage", AuthAdmin, Control.SetSettings);
route.post("/dashboard/signin", Control.UserRootLogin);

//- Premiações
route.post("/awards/qr-code", Control.GetAwardQrCode);
route.post("/awards/qr-code/payment", Control.ConfirmAwardPayment);

//-Transações

route.get("/transactions", AuthAdmin, Control.GetTransactions);
route.get("/transaction/details", Middle.ID, AuthAdmin, Control.GetTransaction);
route.delete("/transactions", Middle.ID, AuthAdmin, Control.ClearTransactions);

export default route;
