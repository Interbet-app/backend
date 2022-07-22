import { Op } from "sequelize";
import { bets, IBetModel } from "../models";
import { IBet } from "../interfaces";

export class Bets {
   static async getAll(): Promise<IBetModel[]> {
      return await bets.findAll();
   }
   static async getById(id: number): Promise<IBetModel | null> {
      return await bets.findByPk(id);
   }
   static async getByUserId(userId: number): Promise<IBetModel[]> {
      return await bets.findAll({ where: { userId: userId } });
   }
   static async create(bet: IBet): Promise<IBetModel> {
      return await bets.create(bet);
   }
   static async getByOdds(odds: Array<number>): Promise<IBetModel[]> {
      return await bets.findAll({
         where: {
            oddId: {
               [Op.in]: odds,
            },
         },
      });
   }
}

