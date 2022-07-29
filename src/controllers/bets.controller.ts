import { Request, Response } from "express";
import { Bets, Odds,Wallets } from "../repositories";
import { IBet } from "../interfaces";
import AppError from "../error";
import { Jwt } from "../auth";
import { Token } from "../types";

export async function GetUserBets(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const bets = await Bets.getByUserId(token.userId);
      const response = bets.map((bet) => {
         return {
            id: bet.id,
            userId: bet.userId,
            oddId: bet.oddId,
            amount: bet.amount,
            payout: bet.payout,
            status: bet.status,
            result: bet.result,
            createdAt: bet.createdAt,
            updatedAt: bet.updatedAt,
         };
      });
      res.status(200).json({ bets: response });
   } catch (error) {
      next(error);
   }
}
export async function GetBets(_req: Request, res: Response, next: any) {
   try {
      const bets = await Bets.getAll();
      const response = bets.map((bet) => {
         return {
            id: bet.id,
            userId: bet.userId,
            oddId: bet.oddId,
            amount: bet.amount,
            payout: bet.payout,
            status: bet.status,
            result: bet.result,
            createdAt: bet.createdAt,
            updatedAt: bet.updatedAt,
         };
      });
      res.status(200).json({ bets: response });
   } catch (error) {
      next(error);
   }
}
export async function CreateBet(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const wallet = await Wallets.getByUserId(token.userId);
      if (!wallet) throw new AppError(404, "Wallet not found");

      const { oddId, amount } = req.body;
      const odd = await Odds.getById(oddId);
      if (!odd) throw new AppError(404, "Odd not found");
      if (odd.status !== "open") throw new AppError(400, "Odd is not active");
      if (parseFloat(amount) > Number(wallet.balance)) throw new AppError(400, "User not have sufficient funds");
      if (parseFloat(amount) > Number(odd.maxBetAmount))
         throw new AppError(400, "Bet amount exceeded the odd's limit amount!");

      const bet = await Bets.create({
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

      wallet.balance = Number(wallet.balance) - parseFloat(amount);
      wallet.blocked = Number(wallet.blocked) + parseFloat(amount);
      await wallet.save();
      res.status(201).json({ 
         id: bet.id,
         userId: bet.userId,
         oddId: bet.oddId,
         amount: bet.amount,
         payout: bet.payout,
         status: bet.status,
         result: bet.result,
         createdAt: bet.createdAt,
         updatedAt: bet.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function DeleteBet(req: Request, res: Response, next: any) {
   try {
      const betId = parseInt(req.params.id, 10);
      const bet = await Bets.getById(betId);
      if (!bet) throw new AppError(404, "Bet not found");
      await bet.destroy();
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
      const odds = await Odds.getByGameId(gameId);
      if (!odds) throw new AppError(404, "Odds not found");
      const searchOdds = odds.map((odd) => odd.id!);
      if (!searchOdds || searchOdds.length === 0) throw new AppError(404, "Game not have bets");
      const bets = await Bets.getByOdds(searchOdds);
      const response = bets.map((bet) => {
         return {
            id: bet.id,
            userId: bet.userId,
            oddId: bet.oddId,
            amount: bet.amount,
            payout: bet.payout,
            status: bet.status,
            result: bet.result,
            createdAt: bet.createdAt,
            updatedAt: bet.updatedAt,
         };
      });
      res.status(200).json({ bets: response });
   } catch (error) {
      next(error);
   }
}
