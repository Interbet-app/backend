import { Request, Response } from "express";
import { Token, Jwt } from "../auth";
import { IWithdrawal } from "../interfaces";
import { wallets, Withdrawals } from "../models";
import { OpenPix } from "../payments";
import AppError from "../error";

export async function UserWithdrawals(_req: Request, res: Response, next: any) {
   try {
      const { userId } = Jwt.getLocals(res, next) as Token;
      const withdrawals = await Withdrawals.findAll({ where: { userId } });
      res.status(200).json(withdrawals as IWithdrawal[]);
   } catch (error) {
      next(error);
   }
}
export async function CreateWithdrawal(req: Request, res: Response, next: any) {
   try {
      const { userId } = Jwt.getLocals(res, next) as Token;
      const { amount, pixKey, pixKeyType } = req.body;
      if (!amount) throw new AppError(400, "Valor não informado");
      if (!pixKey) throw new AppError(400, "Chave pix não informada");
      if (!pixKeyType) throw new AppError(400, "Tipo de chave pix não informado");

      const wallet = await wallets.findOne({ where: { userId } });
      if (!wallet) throw new AppError(400, "Carteira não encontrada");
      if (wallet.balance < amount) throw new AppError(400, "Saldo insuficiente");

      wallet.balance -= Number(amount);
      wallet.updatedAt = new Date();
      await wallet.save();

      const withdrawal = await Withdrawals.create({
         userId,
         amount: Number(amount),
         status: "pendent",
         pixKey,
         pixKeyType,
         createdAt: new Date(),
         updatedAt: new Date(),
      });

      const pix = new OpenPix();
      const result = await pix.Send(withdrawal.id!, Number(amount), pixKey, pixKeyType);
      if (result instanceof AppError) throw result;

      withdrawal.externalStatus = result.externalStatus;
      withdrawal.externalId = result.externalId;
      withdrawal.status = result.externalStatus == "CONFIRMED" ? "completed" : "pendent";
      withdrawal.updatedAt = new Date();
      await withdrawal.save();

      res.status(200).json(withdrawal as IWithdrawal);
   } catch (error) {
      next(error);
   }
}

