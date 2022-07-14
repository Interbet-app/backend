import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IGame } from "../interfaces";

interface CreationAttributes extends Optional<IGame, "id"> {}
export interface IGameModel extends Model<IGame, CreationAttributes>, IGame {}
export const games = Database.define<IGameModel>("games", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   eventId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
   name: { type: Sequelize.STRING(60), allowNull: false },
   status: { type: Sequelize.ENUM("open", "pendent", "closed"), allowNull: false, defaultValue: "open" },
   modality: { type: Sequelize.STRING(40), allowNull: true },
   winnerOddId: { type: Sequelize.INTEGER, allowNull: true },
   result: { type: Sequelize.STRING(60), allowNull: true },
   location: { type: Sequelize.STRING(60), allowNull: true },
   startDate: { type: Sequelize.DATE, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});

