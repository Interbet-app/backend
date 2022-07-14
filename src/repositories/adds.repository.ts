import { adds,IAddsModel } from '../models'
import { IAdds } from '../interfaces'

export class Adds {
   static async getAll(): Promise<IAddsModel[]> {
      return await adds.findAll();
   }

   static async getById(id: number): Promise<IAddsModel | null> {
      return await adds.findByPk(id);
   }

   static async create(add: IAdds): Promise<IAddsModel> {
      return await adds.create(add);
   }

   static async deleteE(id: number): Promise<number> {
      return await adds.destroy({ where: { id: id } });
   }

}