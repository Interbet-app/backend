import { NextFunction, Request, Response } from "express";
import { getAccountDetails } from "../services";
import AppError from "../error";
import axios from "axios";
import { users } from "../models";

export async function AuthMotionUser(req: Request, _: Response, next: NextFunction) {
   try {
      const authorization = req.headers["authorization"] as string;
      if (!authorization) throw new AppError(422, "Authorization header is required!");

      const [_, token] = authorization.split(" ");
      const response = await axios({
         method: "POST",
         url: "https://bmapi-staging.salsaomni.com/games/start.do?language=BR&platform=DESKTOP",
         data: {
            id: 7164,
            mode: "REAL",
            platform: "DESKTOP",
            language: "BR",
         },
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      const userInfo = await getAccountDetails({ token: response.data.token });
      if (!userInfo) throw new AppError(422, "Invalid token!");

      const user = await users.findOne({ where: { name: userInfo.externalUserID } });
      if (!user) throw new AppError(400, "User does not exists.");

      req.user = {
         motionId: userInfo.token,
         id: user.id,
      };

      return next();
   } catch (error: any) {
      next(error);
   }
}

// export async function AuthMotionUser(req: Request, _: Response, next: any) {
//    try {
//       const authorization = req.headers["authorization"] as string;
//       if (!authorization) throw new AppError(422, "Authorization header is required!");

//       const [_, token] = authorization.split(" ");

//       const userInfo = await getAccountDetails({
//          token,
//       });

//       if (!userInfo) {
//          throw new AppError(422, "Invalid token!");
//       }

//       req.user = {
//          id: userInfo.token
//       }

//       return next();
//    } catch (error) {
//       next(error);
//    }
// }
