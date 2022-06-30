import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IEvent } from "../interfaces";

interface CreationAttributes extends Optional<IEvent, "id"> {}
export interface IEventModel extends Model<IEvent, CreationAttributes>, IEvent {}
export const events = Database.define<IEventModel>("events", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING, allowNull: false },
   description: { type: Sequelize.STRING, allowNull: true },
   title: { type: Sequelize.STRING, allowNull: false },
   location: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
