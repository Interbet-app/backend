import { Op } from "sequelize";
import { teams } from "../models";
import { ITeam } from "../interfaces";

export class Teams {
   static getById(id: number): Promise<ITeam | null> {
      return teams.findByPk(id);
   }
   static getAll(): Promise<ITeam[]> {
      return teams.findAll();
   }
   static findByName(name: string): Promise<ITeam[] | null> {
      return teams.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
   }
   static create(team: ITeam): Promise<ITeam> {
      return teams.create(team);
   }
   static update(team: ITeam): Promise<[number]> {
      return teams.update(team, { where: { id: team.id } });
   }
   static delete(id: number): Promise<Number> {
      return teams.destroy({ where: { id: id } });
   }
}

