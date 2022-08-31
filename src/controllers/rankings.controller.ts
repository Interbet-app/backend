import { Request, Response } from "express";
import sequelize, { Op } from "sequelize";
import { bets, rankings, users } from "../models";
import { IRanking } from "../interfaces";

export async function EventRanking(req: Request, res: Response, next: any) {
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

export async function UsersBetsRanking(_req: Request, res: Response, next: any) {
   try {
      const ranking = await bets.findAll({
         attributes: ["userId", [sequelize.fn("sum", sequelize.col("amount")), "amount"]],
         group: ["userId"],
         order: [[sequelize.fn("sum", sequelize.col("amount")), "DESC"]],
      });

      const userIds = ranking.map((pos) => pos.userId);
      const usersRanking = await users.findAll({ where: { id: { [Op.in]: userIds }} });
      const response = ranking.map((pos) => {
         const user = usersRanking.find((user) => user.id === pos.userId);
         return {
            userId: pos.userId,
            username: user?.name,
            picture: user?.picture,
            amount: pos.amount,
         };
      });

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}

