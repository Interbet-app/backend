import { Request, Response } from "express";
import { Wallets, wallets } from "../repositories";
import { IWallet } from "../interfaces";
import { Jwt } from "../auth";
import { Token } from "../types";
import AppError from "../error";

export async function GetWallet(_req: Request, res: Response, next: any) {
   try {
      const token = (await Jwt.getLocals(res, next)) as Token;
      const wallet = await Wallets.ByUserId(token.userId);
      if (!wallet)
         res.status(200).json({
            balance: 0,
            score: 0,
            blocked: 0,
            updatedAt: new Date(),
         });
      else res.status(200).json(wallet);
   } catch (error) {
      next(error);
   }
}
export async function CreateWallet(req: Request, res: Response, next: any) {
   try {
      const { userId, balance, score, blocked } = req.body;
      const wallet = await Wallets.ByUserId(userId);
      if (wallet) throw new AppError(409, "User already has a wallet");
      const newWallet = await Wallets.Create({
         userId,
         balance,
         score,
         blocked,
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
      const { walletId, balance, score, blocked, updatedAt } = req.body;
      const wallet = await wallets.findByPk(walletId);
      if (!wallet) throw new AppError(404, "Wallet not found");
      if (wallet.updatedAt.getTime() !== new Date(updatedAt).getTime())
         throw new AppError(
            403,
            "Wallet has probably been modified between your search and data change, please re-search for updated data!"
         );
      wallet.balance = balance;
      wallet.score = score;
      wallet.blocked = blocked;
      wallet.updatedAt = new Date();
      await wallet.save();
      res.status(200).json(wallet as IWallet);
   } catch (error) {
      next(error);
   }
}

