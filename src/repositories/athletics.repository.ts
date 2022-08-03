import { Op } from "sequelize";
import { athletics } from "../models";
import { IAthletic } from "../interfaces";

export class Athletics {
   static async ById(id: number) {
      return (await athletics.findByPk(id)) as IAthletic;
   }
   static async ByName(name: string) {
      return (await athletics.findAll({ where: { name: { [Op.like]: `%${name}%` } } })) as IAthletic[];
   }
   static async All() {
      return (await athletics.findAll()) as IAthletic[];
   }
   static async Create(athletic: IAthletic) {
      return (await athletics.create(athletic)) as IAthletic;
   }
   static async Destroy(id: number) {
      return await athletics.destroy({ where: { id: id } });
   }
}

