import { odds, IOddModel } from "../models";
import { IOdd } from "../interfaces";

export class Odds {
   static getAll(): Promise<IOdd[]> {
      return odds.findAll();
   }
   static getById(id: number): Promise<IOddModel | null> {
      return odds.findByPk(id);
   }
   static getByGameId(gameId: number): Promise<IOdd[] | null> {
      return odds.findAll({ where: { gameId } });
   }
   static create(odd: IOdd): Promise<IOdd> {
      return odds.create(odd);
   }
   static delete(id: number): Promise<Number> {
      return odds.destroy({ where: { id: id } });
   }
}

