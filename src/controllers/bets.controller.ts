import { Request, Response } from "express";
import { Bets, Odds, odds } from "../repositories";
import { wallets } from "../models";
import AppError from "../error";
import { Jwt } from "../auth";
import { Token } from "../types";

export async function GetUserBets(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const bets = await Bets.ByUserId(token.userId);
      res.status(200).json({ bets: bets });
   } catch (error) {
      next(error);
   }
}
export async function GetBets(_req: Request, res: Response, next: any) {
   try {
      const bets = await Bets.All();
      res.status(200).json({ bets: bets });
   } catch (error) {
      next(error);
   }
}
export async function CreateBet(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const wallet = await wallets.findOne({ where: { userId: token.userId } });
      if (!wallet) throw new AppError(404, "Wallet not found");

      const { oddId, amount } = req.body;
      const odd = await odds.findByPk(oddId);
      if (!odd) throw new AppError(404, "Odd not found");
      if (odd.status !== "open") throw new AppError(400, "Odd is not active");
      if (parseFloat(amount) > Number(wallet.balance)) throw new AppError(400, "User not have sufficient funds");
      if (parseFloat(amount) > Number(odd.maxBetAmount)) throw new AppError(400, "Bet amount exceeded the odd's limit amount!");

      const bet = await Bets.Create({
         userId: token.userId,
         oddId: oddId,
         amount: amount,
         payout: odd.payout,
         status: "pendent",
         result: "pendent",
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!bet) throw new AppError(500, "Bet not created");

      odd.amount = Number(odd.amount) + parseFloat(amount);
      odd.payment = Number(odd.payment) + (parseFloat(amount) + (parseFloat(amount) * odd.payout));
      odd.bets = Number(odd.bets) + 1;
      odd.updatedAt = new Date();
      await odd.save();

      wallet.balance = Number(wallet.balance) - parseFloat(amount);
      wallet.blocked = Number(wallet.blocked) + parseFloat(amount);
      await wallet.save();
      
      res.status(201).json(bet);
   } catch (error) {
      next(error);
   }
}
export async function DeleteBet(req: Request, res: Response, next: any) {
   try {
      const betId = parseInt(req.params.id, 10);
      await Bets.Destroy(betId);
      res.status(200).json({
         message:
            "Bet deleted, but user wallet blocked and balance is not updated, where is required, perform the action in a request to put -> wallets!",
      });
   } catch (error) {
      next(error);
   }
}
export async function GetBetsByGame(req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const odds = await Odds.ByGameId(gameId);
      if (!odds) throw new AppError(404, "Odds not found");
      const searchOdds = odds.map((odd) => odd.id!);
      if (!searchOdds || searchOdds.length === 0) throw new AppError(404, "Game not have bets");
      const bets = await Bets.ByOdds(searchOdds);
      res.status(200).json({ bets: bets });
   } catch (error) {
      next(error);
   }
}


