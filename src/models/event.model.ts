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
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
