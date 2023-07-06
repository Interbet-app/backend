import {NextFunction, Request, Response } from "express";
import sequelize, { Op } from "sequelize";
import { athletics, bets, odds, rankings, teams, users } from "../models";
import { IRanking } from "../interfaces";
import { Jwt, Token } from "../auth";
import AppError from "../error";

export async function EventRanking(req: Request, res: Response, next: NextFunction) {
   try {
      const eventId = parseInt(req.params.id, 10);
      const { limit, offset } = req.query;
      const ranking = await rankings.findAll({
         where: { eventId },
         limit: limit ? Number(limit) : 10,
         offset: offset ? Number(offset) : 0,
         order: [["score", "DESC"]],
      });
      const response = ranking.map((pos) => pos as IRanking);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function UsersBetsRanking(_req: Request, res: Response, next: NextFunction) {
   try {
      const ranking = await bets.findAll({
         attributes: ["userId", [sequelize.fn("sum", sequelize.col("amount")), "amount"]],
         group: ["userId"],
         order: [[sequelize.fn("sum", sequelize.col("amount")), "DESC"]],
      });
      const userIds = ranking.map((pos) => pos.userId);
      const usersRanking = await users.findAll({ where: { id: { [Op.in]: userIds } } });
      const response = await Promise.all(ranking.map(async (pos) => {
         const user = usersRanking.find((user) => user.id === pos.userId);
         const athletic = await athletics.findByPk(user?.athleticId);
         return {
            userId: pos.userId,
            username: !user?.anonymous ?user?.name : "Jogador",
            picture: athletic?.picture,
            amount: pos.amount,
         };
      }));
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}

export async function AthleticsRanking(_req: Request, res: Response, next: NextFunction) {
   try {
      const athleticsAll = await athletics.findAll();
      const athleticIds = athleticsAll.map((pos) => pos.id!);
      const teamsAll = await teams.findAll({ where: { athleticId: { [Op.in]: athleticIds } } });
      const teamIds = teamsAll.map((pos) => pos.id!);
      const oddsAll = await odds.findAll({ where: { teamId: { [Op.in]: teamIds } } });

      const response = athleticsAll.map((athletic) => {
         const teamsAffiliated = teamsAll.filter((team) => team.athleticId === athletic.id);
         const teamsIds = teamsAffiliated.map((pos) => pos.id!);
         const amount = oddsAll.reduce((prev, odd) => {
            if (teamsIds.includes(odd.teamId)) return Number(prev) + Number(odd.amount);
            else return Number(prev);
         }, 0);

         return {
            athleticId: athletic.id,
            athleticName: athletic.name,
            athleticAbbreviation: athletic.abbreviation,
            athleticPicture: athletic.picture,
            amount,
         };
      });

      response.sort((a, b) => b.amount - a.amount);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}


export async function UsersRankingHide(req: Request, res: Response, next: NextFunction) {
   try {
      const { username } = req.body;
      const token = Jwt.getLocals(res, next) as Token;
      
      const user = await users.findByPk(token.userId);
      if (!user) throw new AppError(404, "Usuário não encontrado");

      if (user.name !== username) throw new AppError(401, "Usuário não autorizado");
      await user.update({ anonymous: true });
      res.status(200).json({ message: "Usuário oculto com sucesso" });
   } catch (error) {
      next(error);
   }
}

