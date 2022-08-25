import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { INotification } from "../interfaces";

interface CreationAttributes extends Optional<INotification, "id"> {}
export interface INotificationModel extends Model<INotification, CreationAttributes>, INotification {}
export const notifications = Database.define<INotificationModel>("notifications", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   title: { type: Sequelize.STRING(40), allowNull: false },
   message: { type: Sequelize.STRING, allowNull: false },
   unread: { type: Sequelize.BOOLEAN, allowNull: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});

