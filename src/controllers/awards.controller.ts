import { Request, Response } from "express";
import QRCode from "qrcode";

export async function CreateAward(req: Request, res: Response, next: any) {
   try {
      const { name, betAmount, betId } = req.body;

      const url = process.env.NODE_ENV === "production" ? "https://interbet.app" : "http://localhost:3001";

      const teste = await QRCode.toDataURL(`${url}/awards?name=${name}&betAmount=${betAmount}&betId${betId}`);

      res.status(200).json({ ok: teste });
   } catch (error) {
      next(error);
   }
}

