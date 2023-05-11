import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { ISettings } from "../interfaces";

export interface ISettingsModel extends Model<ISettings>, ISettings {}
export const Settings = Database.define<ISettingsModel>("settings", {
   stage: { type: Sequelize.STRING(60), allowNull: false },
   userMaxBetAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 10000 },
});
