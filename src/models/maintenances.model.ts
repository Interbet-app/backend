import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IMaintenance } from "../interfaces";

interface CreationAttributes extends Optional<IMaintenance, "id"> { }
export interface IMaintenanceModel extends Model<CreationAttributes, IMaintenance>, IMaintenance {}
export const maintenances = Database.define<IMaintenanceModel, IMaintenance>("maintenances", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   path: { type: Sequelize.STRING, allowNull: false },
   method: { type: Sequelize.ENUM("ALL", "DELETE", "GET", "POST", "PUT", "PATCH"), allowNull: false },
   group: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});