import { Request, Response } from "express";
import sequelize from "sequelize";
import { wallets } from "../models";
import { IWallet } from "../interfaces";
import { Jwt, Token } from "../auth";
import AppError from "../error";

export async function GetWallet(_req: Request, res: Response, next: any) {
   try {
      const token = (await Jwt.getLocals(res, next)) as Token;
      const wallet = await wallets.findOne({ where: { userId: token.userId } });
      if (!wallet)
         res.status(200).json({
            balance: 0,
            score: 0,
            bonus: 0,
            updatedAt: new Date(),
         });
      else res.status(200).json(wallet);
   } catch (error) {
      next(error);
   }
}
export async function CreateWallet(req: Request, res: Response, next: any) {
   try {
      const { userId, balance, score, bonus } = req.body;
      const wallet = await wallets.findOne({ where: { userId } });
      if (wallet) throw new AppError(409, "Usuário já possui uma carteira!");
      const newWallet = await wallets.create({
         userId,
         balance,
         score,
         bonus,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(201).json(newWallet);
   } catch (error) {
      next(error);
   }
}
export async function UpdateWallet(req: Request, res: Response, next: any) {
   try {
      const { walletId, balance, bonus, score, updatedAt } = req.body;
      const wallet = await wallets.findByPk(walletId);
      if (!wallet) throw new AppError(404, "Carteira não encontrada!");
      if (wallet.updatedAt.getTime() !== new Date(updatedAt).getTime())
         throw new AppError(
            403,
            "Wallet has probably been modified between your search and data change, please re-search for updated data!"
         );
      wallet.balance = balance;
      wallet.score = score;
      wallet.bonus = bonus;
      wallet.updatedAt = new Date();
      await wallet.save();
      res.status(200).json(wallet as IWallet);
   } catch (error) {
      next(error);
   }
}
export async function SumBalances(_req: Request, res: Response, next: any) {
   try {
      const data = await wallets.findOne({
         attributes: [
            [sequelize.fn("sum", sequelize.col("balance")), "balance"],
            [sequelize.fn("sum", sequelize.col("bonus")), "bonus"],
         ],
      });

      res.status(200).json(data);
   } catch (error) {
      next(error);
   }
}

