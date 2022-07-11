import { Op } from "sequelize";
import { athletics } from "../models";
import { IAthletic } from "../interfaces";

export class Athletics {
   static getById(id: number): Promise<IAthletic | null> {
      return athletics.findByPk(id);
   }
   static findByName(name: string): Promise<IAthletic[] | null> {
      return athletics.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
   }
   static getAll(): Promise<IAthletic[]> {
      return athletics.findAll();
   }
   static create(athletic: IAthletic): Promise<IAthletic> {
      return athletics.create(athletic);
   }
   static update(athletic: IAthletic): Promise<[number]> {
      return athletics.update(athletic, { where: { id: athletic.id } });
   }
   static delete(id: number): Promise<Number> {
      return athletics.destroy({ where: { id: id } });
   }
}

