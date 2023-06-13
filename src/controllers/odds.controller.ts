import { NextFunction,Request, Response } from "express";
import { odds } from "../models";
import { IOdd } from "../interfaces";
import AppError from "../error";

export async function GetOdds(_req: Request, res: Response, next: NextFunction) {
   try {
      const result = await odds.findAll();
      res.status(200).json({ odds: result as IOdd[] }); 
   } catch (error) {
      next(error);
   }
}
export async function OddsByGame(_req: Request, res: Response, next: NextFunction) {
   try {
      const gameId = parseInt(_req.params.id, 10);
      const result = await odds.findAll({ where: { gameId } });
      res.status(200).json({ odds: result as IOdd[] });
   } catch (error) {
      next(error);
   }
}
export async function GetOdd(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      const odd = await odds.findByPk(id);
      if (!odd) throw new AppError(404, "Opção não foi encontrada!");
      res.status(200).json(odd as IOdd);
   } catch (error) {
      next(error);
   }
}
export async function CreateOdd(req: Request, res: Response, next: NextFunction) {
   try {
      const { gameId, teamId, name, payout, maxBetAmount, offer, status } = req.body;
      const odd = await odds.create({
         gameId,
         teamId: teamId == -1 ? 0 : teamId,
         name,
         startPayOut: payout,
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
      if (!odd) throw new AppError(400, "Falha ao criar opção!");
      res.status(201).json(odd as IOdd);
   } catch (error) {
      next(error);
   }
}
export async function UpdateOdd(req: Request, res: Response, next: NextFunction) {
   try {
      const { oddId, gameId, name, teamId, payout, maxBetAmount, offer, status,startPayOut } = req.body;
      const odd = await odds.findByPk(oddId);
      if (!odd) throw new AppError(404, "Odd not found");

      if (gameId) odd.gameId = gameId;
      if (name) odd.name = name;
      if (teamId) odd.teamId = teamId;
      if (payout) odd.payout = payout;
      if (maxBetAmount) odd.maxBetAmount = maxBetAmount;
      if (offer) odd.offer = offer;
      if (status) odd.status = status;
      if (startPayOut) odd.startPayOut = startPayOut;
      
      odd.updatedAt = new Date();
      await odd.save();

      res.status(200).json(odd as IOdd);
   } catch (error) {
      next(error);
   }
}
export async function DeleteOdd(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      await odds.destroy({ where: { id } });
      res.status(200).json({ message: "Opção excluída com sucesso!" });
   } catch (error) {
      next(error);
   }
}



