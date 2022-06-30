import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IGame } from "../interfaces";

interface CreationAttributes extends Optional<IGame, "id"> {}
export interface IGameModel extends Model<IGame, CreationAttributes>, IGame {}
export const games = Database.define<IGameModel>("games", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   eventId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
   allowOdds: { type: Sequelize.ARRAY(Sequelize.INTEGER), allowNull: false },
   name: { type: Sequelize.STRING, allowNull: false },
   status: { type: Sequelize.ENUM("open", "pendent", "closed"), allowNull: false, defaultValue: "open" },
   modality: { type: Sequelize.STRING, allowNull: true },
   winnerOdd: { type: Sequelize.INTEGER, allowNull: true },
   result: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
