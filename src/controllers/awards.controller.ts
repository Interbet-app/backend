import {NextFunction, Request, Response } from "express";
import { bets, users } from "../models";
import AppError from "../error";
import QRCode from "qrcode";
import { NewCredit, NewDebit } from "../services/betmotion";

export async function GetAwardQrCode(req: Request, res: Response, next: NextFunction) {
   try {
      const { betId } = req.body;

      const bet = await bets.findByPk(Number(betId));
      if (!bet) throw new AppError(404, "Bet not found");
      if (bet.award === "not") throw new AppError(422, "Aposta não tem direito a prêmio");
      if (bet.award === "completed") throw new AppError(422, "Prêmio já foi pago");

      const user = await users.findByPk(bet.userId);
      if (!user) throw new AppError(404, "Usuário não encontrado");

      const url = process.env.NODE_ENV === "production" ? "https://interbet.app" : "http://localhost";
      const qrcode = await QRCode.toDataURL(`${url}/awards?betId=${betId}&userName=${user.name}&betAmount=${bet.amount}`);

      res.status(200).json({ qrcode });
   } catch (error) {
      next(error);
   }
}
export async function ConfirmAwardPayment(req: Request, res: Response, next: NextFunction) {
   try {
      const { betId, code } = req.body;
      if (!betId || !code) throw new AppError(422, "Parâmetros inválidos");
      //if (code !== process.env.AWARD_CODE) throw new AppError(401, "Código de autorização inválido");
      if (code !== "123456") throw new AppError(401, "Código de autorização inválido");

      const bet = await bets.findByPk(Number(betId));
      if (!bet) throw new Error("Bet not found");
      
      bet.award = "completed";
      await bet.save();

      res.status(200).json({ massage: "Prêmio pago com sucesso" });
   } catch (error) {
      next(error);
   }
}
export async function NewCreditAmount(req: Request, res: Response, next: NextFunction) {
   try {
      const { userToken, amount } = req.body;
      const betId = parseInt(req.params.id, 10);
      const bet = await bets.findByPk(betId);
      if (!bet) throw new AppError(404, "Aposta não encontrada!");
      await NewCredit(betId, userToken, bet.amount)
      res.status(200).json({
         message: "NewCredit",
      });
   } catch (error) {
      next(error);
   }
}
export async function NewDebitAmount(req: Request, res: Response, next: NextFunction) {
   try {
      const { userToken, amount } = req.body;
      const betId = parseInt(req.params.id, 10);
      const bet = await bets.findByPk(betId);
      if (!bet) throw new AppError(404, "Aposta não encontrada!");
      const newDebit = await NewDebit(betId, userToken, bet.amount)
      res.status(200).json({
         message: newDebit,
      });
   } catch (error) {
      next(error);
   }
}
