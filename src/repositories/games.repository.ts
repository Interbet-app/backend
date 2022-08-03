import { games, odds, IGameModel } from "../models";
import { IGame, IOdd } from "../interfaces";

export class Games {
   static async All() {
      return (await games.findAll()) as IGame[];
   }
   static async ById(id: number) {
      return (await games.findByPk(id)) as IGame;
   }
   static async Create(game: IGame) {
      return (await games.create(game)) as IGame;
   }
   static async Destroy(id: number) {
      return await games.destroy({ where: { id: id } });
   }
}

