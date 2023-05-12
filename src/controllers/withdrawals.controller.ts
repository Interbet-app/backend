import { NextFunction, Request, Response } from "express";
import { Token, Jwt } from "../auth";
import { IWithdrawal } from "../interfaces";
import { deposits, wallets, Withdrawals, bets } from "../models";
import AppError from "../error";

export async function UserWithdrawals(_req: Request, res: Response, next: NextFunction) {
   try {
      const { userId } = Jwt.getLocals(res, next) as Token;
      const withdrawals = await Withdrawals.findAll({ where: { userId } });
      res.status(200).json(withdrawals as IWithdrawal[]);
   } catch (error) {
      next(error);
   }
}
export async function CreateWithdrawal(req: Request, res: Response, next: NextFunction) {
   try {
      const { userId } = Jwt.getLocals(res, next) as Token;
      const { amount, pixKey, pixKeyType } = req.body;
      if (!amount) throw new AppError(400, "Forneça o valor do saque!");
      if (amount < 100) throw new AppError(400, "O valor mínimo para saque é de R$ 100,00!");
      if (!pixKey) throw new AppError(400, "Chave pix não informada");
      if (!pixKeyType) throw new AppError(400, "Tipo de chave pix não informado");

      const value = parseFloat(amount);

      const wallet = await wallets.findOne({ where: { userId } });
      if (!wallet) throw new AppError(400, "Carteira não encontrada");
      if (wallet.balance < amount) throw new AppError(400, "Saldo insuficiente para realizar o saque!");

      const lastDeposit = await deposits.findOne({ where: { userId }, order: [["updatedAt", "DESC"]] });
      if (!lastDeposit) throw new AppError(400, "Para realizar saques é necessário ter feito um depósito");

      const lastBet = await bets.findOne({ where: { userId }, order: [["createdAt", "DESC"]] });
      if (!lastBet) throw new AppError(400, "Para realizar saques é necessário ter feito uma aposta");

      wallet.balance = Number(wallet.balance) - value;
      wallet.updatedAt = new Date();
      await wallet.save();

      const withdrawal = await Withdrawals.create({
         userId,
         amount: value,
         status: "pendent",
         pixKey,
         pixKeyType,
         createdAt: new Date(),
         updatedAt: new Date(),
      });

      // const pix = new OpenPix();
      // const result = await pix.Send(`${withdrawal.id}`, value, pixKey, pixKeyType);
      // if (result instanceof AppError) throw result;

      // withdrawal.externalStatus = result.externalStatus;
      // withdrawal.externalId = result.externalId;
      // withdrawal.status = result.externalStatus == "CONFIRMED" ? "completed" : "pendent";
      // withdrawal.updatedAt = new Date();
      // await withdrawal.save();

      res.status(200).json(withdrawal as IWithdrawal);
   } catch (error) {
      next(error);
   }
}
