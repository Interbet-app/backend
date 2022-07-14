import { Op } from "sequelize";
import { maintenances, IMaintenanceModel } from "../models";
import { IMaintenance } from "../interfaces";

export class Maintenances {
   static async getAll(): Promise<IMaintenanceModel[]> {
      return await maintenances.findAll();
   }

   static async getById(id: number): Promise<IMaintenanceModel | null> {
      return await maintenances.findByPk(id);
   }

   static async getByUserId(userId: number): Promise<IMaintenanceModel[]> {
      return await maintenances.findAll({ where: { userId: userId } });
   }

   static async getByGroup(group: string): Promise<IMaintenanceModel[]> {
      return await maintenances.findAll({ where: { group: { [Op.like]: `%${group}%` } } });
   }

   static async create(maintenance: IMaintenance): Promise<IMaintenanceModel> {
      return await maintenances.create(maintenance);
   }

   static async delete(id: number): Promise<number> {
      return await maintenances.destroy({ where: { id: id } });
   }
}

