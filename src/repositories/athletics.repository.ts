import { Op } from "sequelize";
import { athletics,IAthleticModel } from "../models";
import { IAthletic } from "../interfaces";

export class Athletics {
   static getById(id: number): Promise<IAthleticModel | null> {
      return athletics.findByPk(id);
   }
   static findByName(name: string): Promise<IAthleticModel[] | null> {
      return athletics.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
   }
   static getAll(): Promise<IAthleticModel[]> {
      return athletics.findAll();
   }
   static create(athletic: IAthletic): Promise<IAthleticModel> {
      return athletics.create(athletic);
   }
   static delete(id: number): Promise<Number> {
      return athletics.destroy({ where: { id: id } });
   }
}





