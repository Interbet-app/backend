import { Op } from "sequelize";
import { teams,ITeamModel } from "../models";
import { ITeam } from "../interfaces";

export class Teams {
   static getById(id: number): Promise<ITeamModel | null> {
      return teams.findByPk(id);
   }
   static getAll(): Promise<ITeamModel[]> {
      return teams.findAll();
   }
   static findByName(name: string): Promise<ITeamModel[] | null> {
      return teams.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
   }
   static create(team: ITeam): Promise<ITeamModel> {
      return teams.create(team);
   }
   static delete(id: number): Promise<Number> {
      return teams.destroy({ where: { id: id } });
   }
}






