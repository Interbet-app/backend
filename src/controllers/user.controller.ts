import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt } from "../utils/jwt";
import { Token } from "../types";
import logger from "../log";

export async function Logout(_req: Request, res: Response) {
   try {
      const token = Jwt.getLocals(res) as Token;
      if (!token) return res.status(401).json({ message: "Token not found!" });
      Cache.set(`${token.userId}`, token.jwt);
      return res.status(200).json({ message: "Logout successful!" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error!" });
   }
}
