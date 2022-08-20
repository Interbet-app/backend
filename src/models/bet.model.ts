import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IBet } from "../interfaces";

interface CreationAttributes extends Optional<IBet, "id"> {}
export interface IBetModel extends Model<IBet, CreationAttributes>, IBet {}
export const bets = Database.define<IBetModel>("bets", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   oddId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
   payout: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   status: { type: Sequelize.ENUM("pendent", "completed"), allowNull: false },
   result: { type: Sequelize.ENUM("pendent", "win", "lose"), allowNull: false },
   group: { type: Sequelize.STRING, allowNull: true },
   paid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});

