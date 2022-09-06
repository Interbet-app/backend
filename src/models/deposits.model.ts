import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IDeposit } from "../interfaces";

interface CreationAttributes extends Optional<IDeposit, "id"> {}
export interface IDepositModel extends Model<IDeposit, CreationAttributes>, IDeposit {}
export const deposits = Database.define<IDepositModel>("deposits", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   uniqueId: { type: Sequelize.STRING, allowNull: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   status: { type: Sequelize.ENUM, values: ["pendent", "completed", "canceled"], allowNull: false },
   externalTransactionId: { type: Sequelize.STRING, allowNull: true },
   externalStatus: { type: Sequelize.STRING, allowNull: true },
   externalUrl: { type: Sequelize.STRING, allowNull: true },
   externalQrCode: { type: Sequelize.TEXT("medium"), allowNull: true },
   externalQrCodeContent: { type: Sequelize.TEXT("medium"), allowNull: true },
   externalAmount: { type: Sequelize.INTEGER, allowNull: true },
   expireAt: { type: Sequelize.DATE, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});


