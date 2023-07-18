import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IEvent } from "../interfaces";

interface CreationAttributes extends Optional<IEvent, "id"> {}
export interface IEventModel extends Model<IEvent, CreationAttributes>, IEvent {}
export const events = Database.define<IEventModel>("events", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING(60), allowNull: false },
   description: { type: Sequelize.STRING, allowNull: true },
   title: { type: Sequelize.STRING(40), allowNull: false },
   location: { type: Sequelize.STRING(80), allowNull: true },
   startDate: { type: Sequelize.DATE, allowNull: false },
   endDate: { type: Sequelize.DATE, allowNull: false },
   type: { type: Sequelize.ENUM("stitches", "kill"), allowNull: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
