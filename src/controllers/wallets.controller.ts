import { Request, Response } from "express";
import { Wallets } from "../repositories";
import { Jwt } from "../auth";
import { Token } from "../types";
import AppError from "../error";

export async function GetWallet(_req: Request, res: Response, next: any) {
   try {
      const token = (await Jwt.getLocals(res, next)) as Token;
      const wallet = await Wallets.getByUserId(token.userId);
      if (!wallet) throw new AppError(404, "Wallet not found!");
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

