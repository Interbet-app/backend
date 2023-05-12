import { NextFunction, Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt, Token } from "../auth";
import { users } from "../models";
import { IUser } from "../interfaces";
import AppError from "../error";
import { AccountDetails, SignIn, GetBalance } from "../services/betmotion";

export async function GetUser(_req: Request, res: Response, next: NextFunction) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findByPk(token.userId);
      if (!user) throw new AppError(404, "Usuário não encontrado");
      res.status(200).json(user as IUser);
   } catch (error) {
      next(error);
   }
}
export async function SignInBetMotion(req: Request, res: Response, next: NextFunction) {
   try {
      const authorization = req.headers["authorization"] as string;
      if (!authorization) throw new AppError(422, "Authorization header is required!");

      const betmotionToken = await SignIn(authorization.split(" ")[1]);
      if (!betmotionToken.token) throw new AppError(401, "Não foi possível obter token do usuário!");

      const betmotionUser = await AccountDetails(betmotionToken.token);
      if (!betmotionUser) throw new AppError(400, "Não foi possível obter informações do usuário!");

      const balanceInfo = await GetBalance(betmotionUser.token);
      if (!balanceInfo?.externalUserID) throw new AppError(400, "Não foi possível obter saldo do usuário!");

      let interbetUser = await users.findOne({ where: { betmotionUserID: balanceInfo.externalUserID } });
      if (!interbetUser) {
         interbetUser = await users.create({
            name: betmotionUser.loginName,
            betmotionUserID: betmotionUser.externalUserID,
            betmotionUserToken: betmotionToken.token,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
      } else {
         interbetUser.betmotionUserToken = betmotionToken.token;
         await interbetUser.save();
      }

      res.status(200).json({
         token: Jwt.sign(interbetUser.id!, next),
         betmotionToken: betmotionUser.token,
         betmotionUserID: balanceInfo?.externalUserID,
         balance: Number(balanceInfo?.balance) / 100,
         name: interbetUser.name,
         athleticId: interbetUser.athleticId,
      });
   } catch (error) {
      next(error);
   }
}
export async function GetAllUsers(_req: Request, res: Response, next: NextFunction) {
   try {
      const accounts = await users.findAll();
      const response = accounts.map((account) => account as IUser);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function UserUpdate(req: Request, res: Response, next: NextFunction) {
   try {
      const { athleticId } = req.body;
      const { userId } = Jwt.getLocals(res, next) as Token;
      const user = await users.findByPk(userId);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
      if (athleticId) user.athleticId = athleticId;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json(user as IUser);
   } catch (error) {
      next(error);
   }
}
export async function UserSetMaxBet(req: Request, res: Response, next: NextFunction) {
   try {
      const { maxBetAmount, userId } = req.body;
      const user = await users.findByPk(userId);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
      if (maxBetAmount) user.maxBetAmount = maxBetAmount;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json({ message: "Valor máximo de aposta alterado com sucesso!" });
   } catch (error) {
      next(error);
   }
}
export async function Logout(_req: Request, res: Response, next: NextFunction) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      Cache.set(`${token.userId}`, token.jwt, 1800);
      res.status(200).json({ message: "Logout realizado com sucesso" });
   } catch (error) {
      next(error);
   }
}
export async function DeleteUser(req: Request, res: Response, next: NextFunction) {
   try {
      const userId = parseInt(req.params.id, 10);
      await users.destroy({ where: { id: userId } });
      res.status(200).json({
         message: "Usuário excluído com sucesso!",
      });
   } catch (error) {
      next(error);
   }
}
