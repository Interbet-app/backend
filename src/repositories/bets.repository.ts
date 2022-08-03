import { Op } from "sequelize";
import { bets, IBetModel } from "../models";
import { IBet } from "../interfaces";

export class Bets {
   static async All() {
      return (await bets.findAll()) as IBet[];
   }
   static async ById(id: number) {
      return (await bets.findByPk(id)) as IBet;
   }
   static async ByUserId(userId: number) {
      return (await bets.findAll({ where: { userId: userId } })) as IBet[];
   }
   static async Create(bet: IBet) {
      return (await bets.create(bet)) as IBet;
   }
   static async ByOdds(odds: Array<number>) {
      return (await bets.findAll({
         where: {
            oddId: {
               [Op.in]: odds,
            },
         },
      })) as IBet[];
   }
   static async Destroy(id: number) {
      return (await bets.destroy({ where: { id: id } }));
   }
}

