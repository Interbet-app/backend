import { games, IGameModel } from "../models";
import { IGame } from "../interfaces";

export class Games {
   static async getAll(): Promise<IGame[]> {
      return await games.findAll();
   }
   static async getById(id: number): Promise<IGameModel | null> {
      return await games.findByPk(id);
   }
   static async create(game: IGame): Promise<IGame> {
      return await games.create(game);
   }
   static async delete(id: number): Promise<number> {
      return await games.destroy({ where: { id: id } });
   }
}