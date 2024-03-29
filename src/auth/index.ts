import { Response } from "express";
import AppError from "../error";
import jwt, { VerifyOptions } from "jsonwebtoken";
import logger from "../log";

export type Token = {
   userId: number;
   jwt?: string;
};

export class Jwt {
   static publicKey = process.env.JWT_RSA_PUBLIC as string;
   static privateKey = process.env.JWT_RSA_SECRET as string;
   static expires = parseInt(`${process.env.JWT_EXPIRATION}`, 10);

   static async sign(userId: number, next: any) {
      try {
         let token: Token = { userId };
         const processKey = Jwt.privateKey.replace(/\\n/gm, "\n");
         return jwt.sign(token, processKey, { expiresIn: Jwt.expires, algorithm: "RS512" });
      } catch (error) {
         next(error);
      }
   }
   static async verify(token: string, next: any): Promise<Token | null> {
      try {
         const processKey = Jwt.publicKey.replace(/\\n/gm, "\n");
         const result = jwt.verify(token, processKey, { algorithm: ["RS512"] } as VerifyOptions) as Token;
         return {
            userId: result.userId,
            jwt: token,
         };
      } catch (error) {
         next(error);
         return null;
      }
   }
   static getLocals(res: Response, next: any): Token | unknown {
      try {
         const payload = res.locals.payload as Token;
         if (!payload) throw new AppError(400, "Can't get locals!");
         return payload;
      } catch (error) {
         next(error);
      }
   }
}





