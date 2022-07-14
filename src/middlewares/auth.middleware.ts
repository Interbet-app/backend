import { Request, Response } from "express";
import { Cache } from "../cache/index";
import AppError from "../error";
import { Jwt } from "../auth";
import { OAuth2Client } from "google-auth-library";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const googleOAuth = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function AuthUser(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["authorization"] as string;
      if (!token) throw new AppError(422, "Authorization header is required!");
      //Verificar se o token é válido
      const result = await Jwt.verify(token, next);
      if (!result) throw new AppError(403, "Authorization token is Invalid!");
      //Verificar caso o token seja um token inválido por conta do logout
      const user = await Cache.get(`${result.userId}`);
      if (!user && user == token) throw new AppError(403, "Authorization is invalid!");
      //Carregar validação no payload
      res.locals.payload = result;
      next();
   } catch (error) {
      next(error);
   }
}

export async function AuthGoogle(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["google_authentication"] as string;
      if (!token) throw new AppError(422, "Google authentication header is required!");
      const ticket = await googleOAuth.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      res.locals.payload = payload;
      next();
   } catch (error) {
      next(error);
   }
}

