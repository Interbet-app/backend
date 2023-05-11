import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { ISettings } from "../interfaces";

interface CreationAttributes extends Optional<ISettings, "id"> {}
export interface ISettingsModel extends Model<ISettings, CreationAttributes>, ISettings {}
export const Settings = Database.define<ISettingsModel>(
   "settings",
   {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      stage: { type: Sequelize.STRING(60), allowNull: false },
      userMaxBetAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 10000 },
   },
   {
      timestamps: false,
   }
);
