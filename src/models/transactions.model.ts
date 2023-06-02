import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IBetTransaction } from "../interfaces";

interface CreationAttributes extends Optional<IBetTransaction, "id"> {}
export interface IBetTransactionModel extends Model<IBetTransaction, CreationAttributes>, IBetTransaction {}

export const BetmotionTransactions = Database.define<IBetTransactionModel>(
   "betmotion_transactions",
   {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      userToken: { type: Sequelize.STRING(60), allowNull: false },
      action: { type: Sequelize.STRING(20), allowNull: false },
      betId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      requestXml: { type: Sequelize.TEXT, allowNull: false },
      responseXml: { type: Sequelize.TEXT, allowNull: false },
      createdAt: Sequelize.DATE,
   },
   {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
   }
);
