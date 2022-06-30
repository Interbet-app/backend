import { Request, Response } from "express";
import { Cache } from "../cache/index";
import { Jwt } from "../utils/jwt";

export async function AuthUser(req: Request, res: Response, next: any) {
   try {
      const token = req.headers["Authorization"] as string;

      if (!token) return res.status(422).json({ message: "Authorization header is required!" });
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
