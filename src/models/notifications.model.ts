import { DataTypes, Model, Optional } from "sequelize";
import { INotification } from "../interfaces";
import Database from "../database";

interface CreationAttributes extends Optional<INotification, "id"> {}
export interface INotificationModel extends Model<INotification, CreationAttributes>, INotification {}
export const notifications = Database.define<INotificationModel>("notifications", {
   id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
   title: { type: DataTypes.STRING(40), allowNull: false },
   message: { type: DataTypes.STRING, allowNull: false },
   unread: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
   createdAt: DataTypes.DATE,
   updatedAt: DataTypes.DATE,
});
