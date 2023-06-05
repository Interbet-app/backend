import { NextFunction, Request, Response } from "express";
import { BetmotionTransactions } from "../models";

export async function GetTransactions(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await BetmotionTransactions.findAll();
      res.status(200).json({ transactions: data });
   } catch (error) {
      next(error);
   }
}
export async function GetTransaction(req: Request, res: Response, next: NextFunction) {
   try {
      const transactionId = parseInt(req.query.transactionId as string);
      const transaction = await BetmotionTransactions.findByPk(transactionId);
      res.status(200).json(transaction);
   } catch (error) {
      next(error);
   }
}

export async function ClearTransactions(_req: Request, res: Response, next: NextFunction) {
   try {
      await BetmotionTransactions.destroy({ where: {} });
      res.status(200).json({ message: "Histórico de transações excluídas com sucesso!" });
   } catch (error) {
      next(error);
   }
}
