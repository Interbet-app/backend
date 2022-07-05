import { Request, Response } from "express";
import { Cache } from "../cache/index";
import { Jwt } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import logger from "../log";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const googleOAuth = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function AuthUser(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["authorization"] as string;
      if (!token) return res.status(422).json({ message: "authorization header is required!" });
      const result = await Jwt.verify(token);
      if (!result) return res.status(403).json({ message: "Authorization is invalid!" });
      //Verificar caso o token seja um token inválido por conta do logout
      const user = await Cache.get(`${result.userId}`);
      if (!user && user == token) return res.status(403).json({ message: "Authorization is invalidated!" });
      //Carregar validação no payload
      res.locals.payload = result;
      next();
   } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
   }
}

export async function AuthGoogle(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["google_authentication"] as string;
      if (!token) return res.status(403).json({ message: "Google authentication token is required!" });
      const ticket = await googleOAuth.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      res.locals.payload = payload;
      next();
   } catch (error) {
      logger.error(error);
      res.status(403).json({ message: "Internal server error!" });
   }
}

