import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IPlayer } from "../interfaces";

interface CreationAttributes extends Optional<IPlayer, "id"> { }
export interface IPlayerModel extends Model<IPlayer, CreationAttributes>, IPlayer { }
export const players = Database.define<IPlayerModel>("players", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   teamId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
   name: { type: Sequelize.STRING(40), allowNull: false },
   position: { type: Sequelize.STRING(40), allowNull: false },
   holder: { type: Sequelize.BOOLEAN, allowNull: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});