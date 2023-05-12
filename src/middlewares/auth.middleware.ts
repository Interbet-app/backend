import { NextFunction, Request, Response } from "express";
import { Cache } from "../cache/index";
import { Jwt, Token } from "../auth";
import { maintenances } from "../models";
import { IMaintenance } from "../interfaces";
import AppError from "../error";

export async function AuthUser(req: Request, res: Response, next: NextFunction) {
   try {
      const token = req.headers["authorization"] as string;
      if (!token) throw new AppError(422, "Authorization header is required!");

      //  Verificar se o token é válido
      const result = (await Jwt.verify(token, next)) as Token;
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

export async function AuthAdmin(req: Request, res: Response, next: NextFunction) {
   try {
      const { method, path } = req;

      const token = req.headers["authorization"] as string;
      if (!token) throw new AppError(422, "Authorization header is required!");

      //  Verificar se o token é válido
      const result = (await Jwt.verify(token, next)) as Token;
      if (!result) throw new AppError(403, "Authorization token is Invalid!");

      //  Verificar caso o token seja um token inválido por conta do logout
      const user = await Cache.get(`${result.userId}`);
      if (!user && user == token) throw new AppError(403, "Authorization is invalid!");

      const data = await maintenances.findAll({ where: { userId: result.userId } });
      let filter = path.substring(1, path.indexOf("/", 1));
      if (filter.length < 2) filter = path.substring(1);

      const roles = data.filter((maintenance: IMaintenance) => maintenance.path == filter || maintenance.path == "ALL");
      if (roles.length === 0) throw new AppError(403, `User is not allowed to access the route '${path}'!`);

      const allowed = roles.filter((allow) => allow.method === "ALL" || allow.method == method.toUpperCase());
      if (!allowed) throw new AppError(403, `User is not allowed to access the '${method}' in the route '${path}'!`);

      //  Carregar validação no payload
      res.locals.payload = result;
      next();
   } catch (error) {
      next(error);
   }
}
