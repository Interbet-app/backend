import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IOdd } from "../interfaces";

interface CreationAttributes extends Optional<IOdd, "id"> {}
export interface IOddModel extends Model<IOdd, CreationAttributes>, IOdd {}
export const odds = Database.define<IOddModel>("odds", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING, allowNull: false },
   team: { type: Sequelize.STRING, allowNull: false },
   payout: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   maxBetAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   payment: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   bets: { type: Sequelize.INTEGER, allowNull: false },
   score: { type: Sequelize.INTEGER, allowNull: false },
   offer: { type: Sequelize.BOOLEAN, allowNull: false },
   status: { type: Sequelize.ENUM("open", "lock"), allowNull: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
