import { Request, Response } from "express";
import { Wallets } from "../repositories";
import { Jwt } from "../auth";
import { Token } from "../types";
import AppError from "../error";

export async function GetWallet(_req: Request, res: Response, next: any) {
   try {
      const token = (await Jwt.getLocals(res, next)) as Token;
      const wallet = await Wallets.getByUserId(token.userId);
      if (!wallet) 
         res.status(200).json({ 
            balance: 0,
            score: 0,
            blocked: 0,
            updatedAt: new Date(),
          });
      else
         res.status(200).json({
            balance: wallet.balance,
            blocked: wallet.blocked,
            score: wallet.score,
            updatedAt: wallet.updatedAt,
         });
   } catch (error) {
      next(error);
   }
}
export async function UpdateWallet(req: Request, res: Response, next: any) {
   try {
      const { walletId, balance, score, blocked, updatedAt } = req.body;
      const wallet = await Wallets.getById(walletId);
      if (!wallet) throw new AppError(404, "Wallet not found");
      if (wallet.updatedAt.getTime() !== updatedAt.getTime())
          throw new AppError(403, "Wallet has probably been modified between your search and data change, please re-search for updated data!");
      if (balance) wallet.balance = balance;
      if (score) wallet.score = score;
      if (blocked) wallet.blocked = blocked;
      await wallet.save();
      res.status(200).json({
         balance: wallet.balance,
         blocked: wallet.blocked,
         score: wallet.score,
         updatedAt: wallet.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
