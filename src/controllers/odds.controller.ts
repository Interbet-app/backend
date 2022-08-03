import { Request, Response } from "express";
import { Odds, odds } from "../repositories";
import { IOdd } from "../interfaces";
import AppError from "../error";

export async function GetOdds(_req: Request, res: Response, next: any) {
   try {
      const odds = await Odds.All();
      res.status(200).json({ odds: odds });
   } catch (error) {
      next(error);
   }
}
export async function OddsByGame(_req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(_req.params.id, 10);
      const odds = await Odds.ByGameId(gameId);
      res.status(200).json({ odds: odds });
   } catch (error) {
      next(error);
   }
}
export async function GetOdd(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(400, "Missing odd id!");
      const odd = await Odds.ById(id);
      if (!odd) throw new AppError(404, "Odd not found");
      res.status(200).json(odd);
   } catch (error) {
      next(error);
   }
}
export async function CreateOdd(req: Request, res: Response, next: any) {
   try {
      const { gameId, teamId, name, payout, maxBetAmount, offer, status } = req.body;
      const odd = await Odds.Create({
         gameId,
         teamId: teamId == -1 ? 0 : teamId,
         name,
         payout,
         maxBetAmount,
         offer,
         payment: 0,
         bets: 0,
         amount: 0,
         status: status || "open",
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!odd) throw new AppError(400, "Odd not created");
      res.status(201).json(odd);
   } catch (error) {
      next(error);
   }
}
export async function UpdateOdd(req: Request, res: Response, next: any) {
   try {
      const { oddId, gameId, name, teamId, payout, maxBetAmount, offer, status } = req.body;
      const odd = await odds.findByPk(oddId);
      if (!odd) throw new AppError(404, "Odd not found");

      odd.gameId = gameId;
      odd.name = name;
      odd.teamId = teamId;
      odd.payout = payout;
      odd.maxBetAmount = maxBetAmount;
      odd.offer = offer;
      if(status) odd.status = status;
      odd.updatedAt = new Date();
      await odd.save();
      res.status(200).json(odd as IOdd);
   } catch (error) {
      next(error);
   }
}
export async function DeleteOdd(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(400, "Missing odd id!");
      const deleted = await Odds.Destroy(id);
      if (!deleted) throw new AppError(400, "Odd not deleted");
      res.status(200).json({ message: "Odd deleted" });
   } catch (error) {
      next(error);
   }
}

