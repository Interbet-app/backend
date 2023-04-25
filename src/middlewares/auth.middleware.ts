import { Request, Response } from "express";
import { Cache } from "../cache/index";
import AppError from "../error";
import { Jwt, Token } from "../auth";
import { maintenances, users } from "../models";
import { IMaintenance } from "../interfaces";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const googleOAuth = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function AuthUser(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["authorization"] as string;
      if (!token) throw new AppError(422, "Authorization header is required!");
      //  Verificar se o token é válido
      const result = await Jwt.verify(token, next);
      if (!result) throw new AppError(403, "Authorization token is Invalid!");
      //  Verificar caso o token seja um token inválido por conta do logout
      const user = await Cache.get(`${result.userId}`);
      if (!user && user == token) throw new AppError(403, "Authorization is invalid!");
      //  Carregar validação no payload
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

export async function AuthAdmin(req: Request, res: Response, next: any) {
   try {
      const { method, path } = req;
      const token = Jwt.getLocals(res, next) as Token;
      const { id } = req.user;
      if (!id) throw new AppError(403, "Authorization to admin is invalid!");

      const data = await maintenances.findAll({ where: { userId: id } });
      let filter = path.substring(1, path.indexOf("/", 1));
      if (filter.length < 2) filter = path.substring(1);

      const roles = data.filter((maintenance: IMaintenance) => maintenance.path == filter);
      if (roles.length === 0) throw new AppError(403, `User is not allowed to access the route '${path}'!`);

      const allowed = roles.filter((allow) => allow.method === "ALL" || allow.method == method.toUpperCase());
      if (!allowed) throw new AppError(403, `User is not allowed to access the '${method}' in the route '${path}'!`);

      next();
   } catch (error) {
      next(error);
   }
}

