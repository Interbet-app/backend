import { odds } from "../models";
import { IOdd } from "../interfaces";


export class Odds {
   static async All() {
      return (await odds.findAll()) as IOdd[];
   }
   static async ById(id: number) {
      return (await odds.findByPk(id)) as IOdd;
   }
   static async ByGameId(gameId: number) {
      return (await odds.findAll({ where: { gameId } })) as IOdd[];
   }
   static async Create(odd: IOdd) {
      return (await odds.create(odd)) as IOdd;
   }
   static async Destroy(id: number) {
      return await odds.destroy({ where: { id: id } });
   }
}

