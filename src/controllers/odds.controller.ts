import { Request, Response } from "express";
import { Odds } from "../repositories";
import { IOdd } from "../interfaces";
import AppError from "../error";

export async function GetOdds(_req: Request, res: Response, next: any) {
   try {
      const odds = await Odds.getAll();
      const response = odds.map((odds) => {
         return {
            id: odds.id,
            gameId: odds.gameId,
            teamId: odds.teamId,
            name: odds.name,
            payout: odds.payout,
            amount: odds.amount,
            maxBetAmount: odds.maxBetAmount,
            payment: odds.payment,
            bets: odds.bets,
            score: odds.score,
            offer: odds.offer,
            status: odds.status,
            createdAt: odds.createdAt,
            updatedAt: odds.updatedAt,
         };
      });
      res.status(200).json({ odds: response });
   } catch (error) {
      next(error);
   }
}
export async function GetOdd(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(400, "Missing odd id!");
      const odd = await Odds.getById(id);
      if (!odd) throw new AppError(404, "Odd not found");
      res.status(200).json({
         id: odd.id,
         gameId: odd.gameId,
         teamId: odd.teamId,
         name: odd.name,
         payout: odd.payout,
         amount: odd.amount,
         maxBetAmount: odd.maxBetAmount,
         payment: odd.payment,
         bets: odd.bets,
         score: odd.score,
         offer: odd.offer,
         status: odd.status,
         createdAt: odd.createdAt,
         updatedAt: odd.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function CreateOdd(req: Request, res: Response, next: any) {
   try {
      const { gameId, teamId, name, payout, maxBetAmount, score, offer, status } = req.body;
      const odd = await Odds.create({
         gameId,
         teamId,
         name,
         payout,
         maxBetAmount,
         score,
         offer,
         payment: 0,
         bets: 0,
         amount: 0,
         status: status || "open",
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!odd) throw new AppError(400, "Odd not created");
      res.status(201).json({
         id: odd.id,
         gameId: odd.gameId,
         teamId: odd.teamId,
         name: odd.name,
         payout: odd.payout,
         amount: odd.amount,
         maxBetAmount: odd.maxBetAmount,
         payment: odd.payment,
         bets: odd.bets,
         score: odd.score,
         offer: odd.offer,
         status: odd.status,
         createdAt: odd.createdAt,
         updatedAt: odd.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function UpdateOdd(req: Request, res: Response, next: any) {
   try {
      const { oddId, gameId, name, teamId, payout, maxBetAmount, score, offer, status } = req.body;
      const odd = await Odds.getById(oddId);
      if (!odd) throw new AppError(404, "Odd not found");

      odd.gameId = gameId;
      odd.name = name;
      odd.teamId = teamId;
      odd.payout = payout;
      odd.maxBetAmount = maxBetAmount;
      odd.score = score;
      odd.offer = offer;
      oddId.status = status;
      odd.updatedAt = new Date();
      await odd.save();

      res.status(200).json({
         id: odd.id,
         gameId: odd.gameId,
         teamId: odd.teamId,
         name: odd.name,
         payout: odd.payout,
         amount: odd.amount,
         maxBetAmount: odd.maxBetAmount,
         payment: odd.payment,
         bets: odd.bets,
         score: odd.score,
         offer: odd.offer,
         status: odd.status,
         createdAt: odd.createdAt,
         updatedAt: odd.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function DeleteOdd(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(400, "Missing odd id!");
      const odd = await Odds.getById(id);
      if (!odd) throw new AppError(404, "Odd not found");
      const deleted = await Odds.delete(id);
      if (!deleted) throw new AppError(400, "Odd not deleted");
      res.status(200).json({ message: "Odd deleted" });
   } catch (error) {
      next(error);
   }
}
