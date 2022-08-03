import { Op } from "sequelize";
import { teams } from "../models";
import { ITeam } from "../interfaces";

export class Teams {
   static async ById(id: number) {
      return await teams.findByPk(id) as ITeam;
   }
   static async All() {
      return await teams.findAll() as ITeam[];
   }
   static async ByName(name: string) {
      return await teams.findAll({ where: { name: { [Op.like]: `%${name}%` } } }) as ITeam[];
   }
   static async Create(team: ITeam){
      return await teams.create(team) as ITeam;
   }
   static async Destroy(id: number) {
      return await teams.destroy({ where: { id: id } });
   }
}






