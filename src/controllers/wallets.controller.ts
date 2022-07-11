import { Request, Response } from "express";
import { Wallets } from "../repositories";
import { Jwt } from "../utils/jwt";
import { Token } from "../types";
import logger from "../log";

export async function GetWallet(_req: Request, res: Response) {
   try {
      const token = (await Jwt.getLocals(res)) as Token;
      const wallet = await Wallets.getByUserId(token.userId);
      if (!wallet) return res.status(404).json({ message: "Wallet not found!" });
      return res.status(200).json({ ...wallet });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error" });
   }
}
