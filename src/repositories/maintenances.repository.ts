import { Op } from "sequelize";
import { maintenances, IMaintenanceModel } from "../models";
import { IMaintenance } from "../interfaces";

export class Maintenances {
   static async All(): Promise<IMaintenanceModel[]> {
      return await maintenances.findAll();
   }
   static async ById(id: number): Promise<IMaintenanceModel | null> {
      return await maintenances.findByPk(id);
   }
   static async ByUserId(userId: number): Promise<IMaintenanceModel[]> {
      return await maintenances.findAll({ where: { userId: userId } });
   }
   static async ByGroup(group: string) {
      return await maintenances.findAll({ where: { group: { [Op.like]: `%${group}%` } } }) as IMaintenance[];
   }
   static async Create(maintenance: IMaintenance) {
      return await maintenances.create(maintenance) as IMaintenance;
   }
   static async Destroy(id: number) {
      return await maintenances.destroy({ where: { id: id } });
   }
}

